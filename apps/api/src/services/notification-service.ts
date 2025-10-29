import createHttpError from 'http-errors';
import { z } from 'zod';
import {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  Prisma,
} from '@prisma/client';

import { env } from '@config/env';
import { prisma } from '@lib/prisma';
import { emitToUser } from '@lib/socket';
import { enqueueEmailNotification } from '@jobs/notification-queue';
import { recordAuditLog } from '@repositories/user-repository';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;

const categories = Object.values(NotificationCategory);

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  perPage: z.coerce.number().int().min(1).max(100).default(DEFAULT_PER_PAGE),
  category: z.nativeEnum(NotificationCategory).optional(),
  unreadOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
  search: z.string().trim().min(2).max(120).optional(),
});

const markSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  read: z.boolean().default(true),
});

const preferenceSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
  categories: z.array(z.nativeEnum(NotificationCategory)).optional(),
});

const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  category: z.nativeEnum(NotificationCategory).default(NotificationCategory.SYSTEM),
  channel: z.nativeEnum(NotificationChannel).default(NotificationChannel.IN_APP),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.NORMAL),
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(3).max(2000),
  data: z.record(z.any()).optional(),
  emailFallback: z.boolean().default(false),
});

function buildNotificationSelect(): Prisma.NotificationSelect {
  return {
    id: true,
    category: true,
    channel: true,
    priority: true,
    title: true,
    message: true,
    data: true,
    readAt: true,
    deliveredAt: true,
    createdAt: true,
  } satisfies Prisma.NotificationSelect;
}

type NotificationSelect = ReturnType<typeof buildNotificationSelect>;

type NotificationRecord = Prisma.NotificationGetPayload<{ select: NotificationSelect }>;

type EmailDeliveryStatus = 'not-requested' | 'disabled' | 'preference-disabled' | 'dispatched';

export interface NotificationRealtimePayload {
  notification: NotificationRecord;
  delivery: {
    email: {
      requested: boolean;
      enabled: boolean;
      preferenceEnabled: boolean;
      dispatched: boolean;
      status: EmailDeliveryStatus;
    };
  };
}

async function ensurePreference(userId: string) {
  const preference = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (preference) {
    return preference;
  }

  return prisma.notificationPreference.create({
    data: {
      userId,
      categories,
    },
  });
}

export async function listNotifications(userId: string, query: unknown) {
  const params = listSchema.parse(query);
  const skip = (params.page - 1) * params.perPage;

  const where: Prisma.NotificationWhereInput = { userId };

  if (params.category) {
    where.category = params.category;
  }

  if (params.unreadOnly) {
    where.readAt = null;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { message: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      select: buildNotificationSelect(),
      orderBy: { createdAt: 'desc' },
      skip,
      take: params.perPage,
    }),
  ]);

  return {
    data: items,
    meta: {
      page: params.page,
      perPage: params.perPage,
      total,
      totalPages: Math.ceil(total / params.perPage) || 1,
    },
  };
}

export async function markNotifications(userId: string, payload: unknown) {
  const params = markSchema.parse(payload);

  const result = await prisma.notification.updateMany({
    where: {
      id: { in: params.ids },
      userId,
    },
    data: {
      readAt: params.read ? new Date() : null,
    },
  });

  await recordAuditLog({
    userId,
    action: params.read ? 'notifications.mark_read' : 'notifications.mark_unread',
    entity: 'Notification',
    entityId: params.ids.join(','),
    metadata: { count: result.count },
  });

  return { count: result.count };
}

export async function getPreferences(userId: string) {
  const preference = await ensurePreference(userId);
  return preference;
}

export async function updatePreferences(userId: string, payload: unknown) {
  const params = preferenceSchema.parse(payload);
  const data: Prisma.NotificationPreferenceUpdateInput = {};

  if (params.emailEnabled !== undefined) data.emailEnabled = params.emailEnabled;
  if (params.smsEnabled !== undefined) data.smsEnabled = params.smsEnabled;
  if (params.pushEnabled !== undefined) data.pushEnabled = params.pushEnabled;
  if (params.quietHoursStart !== undefined) data.quietHoursStart = params.quietHoursStart;
  if (params.quietHoursEnd !== undefined) data.quietHoursEnd = params.quietHoursEnd;
  if (params.categories) data.categories = params.categories;

  const preference = await prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      categories: params.categories ?? categories,
      emailEnabled: params.emailEnabled ?? true,
      smsEnabled: params.smsEnabled ?? false,
      pushEnabled: params.pushEnabled ?? true,
      quietHoursStart: params.quietHoursStart,
      quietHoursEnd: params.quietHoursEnd,
    },
  });

  await recordAuditLog({
    userId,
    action: 'notifications.update_preferences',
    entity: 'NotificationPreference',
    entityId: preference.id,
    metadata: preference,
  });

  return preference;
}

export async function createNotification(payload: unknown) {
  const data = createNotificationSchema.parse(payload);

  const preference = await ensurePreference(data.userId);
  const categoryAllowed = preference.categories.length === 0 || preference.categories.includes(data.category);

  const emailDelivery: NotificationRealtimePayload['delivery']['email'] = {
    requested: Boolean(data.emailFallback),
    enabled: env.ENABLE_EMAIL_NOTIFICATIONS,
    preferenceEnabled: preference.emailEnabled,
    dispatched: false,
    status: 'not-requested',
  };

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      category: data.category,
      channel: data.channel,
      priority: data.priority,
      title: data.title,
      message: data.message,
      data: data.data ?? null,
    },
    select: buildNotificationSelect(),
  });

  if (!categoryAllowed) {
    return notification;
  }

  if (emailDelivery.requested) {
    if (!emailDelivery.enabled) {
      emailDelivery.status = 'disabled';
    } else if (!emailDelivery.preferenceEnabled) {
      emailDelivery.status = 'preference-disabled';
    } else {
      const user = await prisma.user.findUnique({ select: { email: true, name: true }, where: { id: data.userId } });
      if (!user) {
        throw createHttpError(404, 'Notification recipient not found');
      }

      await enqueueEmailNotification({
        to: user.email,
        subject: data.title,
        html: `<p>Olá ${user.name?.split(' ')[0] ?? ''},</p><p>${data.message}</p>`,
        text: data.message,
      });

      emailDelivery.dispatched = true;
      emailDelivery.status = 'dispatched';
    }
  }

  emitToUser(data.userId, 'notification:new', {
    notification,
    delivery: {
      email: emailDelivery,
    },
  });

  return notification;
}

export async function deleteNotifications(userId: string, ids: string[]) {
  if (!ids.length) {
    throw createHttpError(400, 'No notification ids provided');
  }

  const result = await prisma.notification.deleteMany({
    where: {
      id: { in: ids },
      userId,
    },
  });

  await recordAuditLog({
    userId,
    action: 'notifications.delete',
    entity: 'Notification',
    metadata: { count: result.count },
  });

  return { count: result.count };
}
