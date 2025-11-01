import createHttpError from 'http-errors';
import { z } from 'zod';
import {
  NotificationCategory,
  NotificationPriority,
  Prisma,
} from '@prisma/client';

import { prisma } from '@lib/prisma';
import { emitToUser } from '@lib/socket';
import { createNotification } from './notification-service';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;

const listThreadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  perPage: z.coerce.number().int().min(1).max(50).default(DEFAULT_PER_PAGE),
  search: z.string().trim().min(2).optional(),
});

const createThreadSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  participantIds: z.array(z.string().cuid()).min(1),
  initialMessage: z.string().trim().min(1).max(4000).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string().trim().min(1).max(200),
      }),
    )
    .optional(),
});

const markReadSchema = z.object({
  lastMessageId: z.string().cuid().optional(),
});

const threadSelect = {
  id: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  participants: {
    select: {
      id: true,
      userId: true,
      role: true,
      lastReadAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      threadId: true,
      senderId: true,
      content: true,
      attachments: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  },
} satisfies Prisma.MessageThreadSelect;

async function assertThreadAccess(userId: string, threadId: string) {
  const participant = await prisma.threadParticipant.findFirst({
    where: { threadId, userId },
  });

  if (!participant) {
    throw createHttpError(403, 'Você não participa desta conversa.');
  }
}

export async function listThreads(userId: string, query: unknown) {
  const params = listThreadsSchema.parse(query);
  const skip = (params.page - 1) * params.perPage;

  const where: Prisma.MessageThreadWhereInput = {
    participants: {
      some: { userId },
    },
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      {
        participants: {
          some: {
            user: {
              name: { contains: params.search, mode: 'insensitive' },
            },
          },
        },
      },
    ];
  }

  const [total, threads] = await prisma.$transaction([
    prisma.messageThread.count({ where }),
    prisma.messageThread.findMany({
      where,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        lastMessageAt: true,
        participants: {
          select: {
            userId: true,
            lastReadAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: params.perPage,
    }),
  ]);

  return {
    data: threads.map((thread) => {
      const participant = thread.participants.find((item) => item.userId === userId);
      const lastMessage = thread.messages[0] ?? null;
      const lastMessageTimestamp = thread.lastMessageAt ?? lastMessage?.createdAt ?? thread.updatedAt;
      const unread =
        participant && lastMessageTimestamp
          ? !participant.lastReadAt || participant.lastReadAt < new Date(lastMessageTimestamp)
          : false;

      return {
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessageAt: lastMessageTimestamp,
        lastMessage,
        participants: thread.participants,
        unreadCount: unread ? 1 : 0,
      };
    }),
    meta: {
      page: params.page,
      perPage: params.perPage,
      total,
      totalPages: Math.ceil(total / params.perPage) || 1,
    },
  };
}

export async function getThread(userId: string, threadId: string) {
  await assertThreadAccess(userId, threadId);

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: threadSelect,
  });

  if (!thread) {
    throw createHttpError(404, 'Conversa não encontrada.');
  }

  return thread;
}

export async function createThread(userId: string, payload: unknown) {
  const params = createThreadSchema.parse(payload);

  const participantIds = Array.from(new Set([userId, ...params.participantIds]));
  const users = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true },
  });

  if (users.length !== participantIds.length) {
    throw createHttpError(400, 'Um ou mais participantes não foram encontrados.');
  }

  const now = new Date();

  const thread = await prisma.$transaction(async (tx) => {
    const created = await tx.messageThread.create({
      data: {
        title: params.title,
        createdById: userId,
        participants: {
          createMany: {
            data: participantIds.map((participant) => ({
              userId: participant,
              role: participant === userId ? 'owner' : 'member',
              joinedAt: now,
              lastReadAt: participant === userId ? now : null,
            })),
          },
        },
      },
      select: threadSelect,
    });

    if (params.initialMessage) {
      await tx.message.create({
        data: {
          threadId: created.id,
          senderId: userId,
          content: params.initialMessage,
        },
      });
      await tx.messageThread.update({
        where: { id: created.id },
        data: { lastMessageAt: now },
      });
    }

    return created;
  });

  return getThread(userId, thread.id);
}

export async function sendMessage(userId: string, threadId: string, payload: unknown) {
  await assertThreadAccess(userId, threadId);
  const params = sendMessageSchema.parse(payload);

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: {
      participants: { select: { userId: true } },
    },
  });

  if (!thread) {
    throw createHttpError(404, 'Conversa não encontrada.');
  }

  const created = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        threadId,
        senderId: userId,
        content: params.content,
        attachments: params.attachments ?? null,
      },
      select: {
        id: true,
        threadId: true,
        senderId: true,
        content: true,
        attachments: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    await tx.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    await tx.threadParticipant.update({
      where: { threadId_userId: { threadId, userId } },
      data: { lastReadAt: new Date() },
    });

    await tx.messageReceipt.createMany({
      data: thread.participants
        .filter((participant) => participant.userId !== userId)
        .map((participant) => ({
          messageId: message.id,
          userId: participant.userId,
        })),
    });

    return message;
  });

  for (const participant of thread.participants.filter((item) => item.userId !== userId)) {
    emitToUser(participant.userId, 'message:new', created);
    await createNotification({
      userId: participant.userId,
      category: NotificationCategory.MESSAGE,
      priority: NotificationPriority.NORMAL,
      title: 'Nova mensagem',
      message: `${created.sender.name} enviou uma mensagem.`,
    });
  }

  return created;
}

export async function markThreadRead(userId: string, threadId: string, payload: unknown) {
  await assertThreadAccess(userId, threadId);
  const params = markReadSchema.parse(payload ?? {});

  await prisma.threadParticipant.update({
    where: { threadId_userId: { threadId, userId } },
    data: { lastReadAt: new Date() },
  });

  if (params.lastMessageId) {
    await prisma.messageReceipt.updateMany({
      where: {
        userId,
        messageId: params.lastMessageId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
