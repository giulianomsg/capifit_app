import { randomUUID } from 'node:crypto';

import createHttpError from 'http-errors';
import {
  AssessmentStatus,
  AssessmentType,
  NotificationCategory,
  NotificationPriority,
  Prisma,
  TrainerClientStatus,
} from '@prisma/client';

import { prisma } from '@lib/prisma';
import { storage } from '@lib/storage';
import { createNotification } from './notification-service';

interface AuthenticatedUser {
  id: string;
  roles: string[];
}

export interface AssessmentPayload {
  clientId: string;
  templateId?: string | null;
  scheduledFor?: Date | string | null;
  notes?: string | null;
  type?: AssessmentType | null;
}

interface CompleteAssessmentPayload {
  status?: AssessmentStatus;
  performedAt?: Date | string | null;
  metrics?: Record<string, unknown> | null;
  notes?: string | null;
}

function isAdmin(user: AuthenticatedUser | undefined) {
  return Boolean(user?.roles?.includes('admin'));
}

function isTrainer(user: AuthenticatedUser | undefined) {
  return Boolean(user?.roles?.includes('trainer'));
}

function ensureTrainerOrAdmin(user: AuthenticatedUser | undefined) {
  if (!user || (!isAdmin(user) && !isTrainer(user))) {
    throw createHttpError(403, 'Trainer or administrator privileges are required');
  }
}

async function ensureClientAssignment(user: AuthenticatedUser | undefined, clientId: string) {
  ensureTrainerOrAdmin(user);

  if (isAdmin(user)) {
    return;
  }

  const assignment = await prisma.trainerClient.findFirst({
    where: {
      trainerId: user!.id,
      clientId,
      status: { not: TrainerClientStatus.ENDED },
    },
  });

  if (!assignment) {
    throw createHttpError(403, 'Você não possui acesso aos dados deste cliente');
  }
}

function resolveTrainerScope(user: AuthenticatedUser | undefined, trainerId?: string | null) {
  ensureTrainerOrAdmin(user);

  if (trainerId) {
    if (!isAdmin(user) && trainerId !== user!.id) {
      throw createHttpError(403, 'Você não possui permissão para consultar este treinador');
    }
    return trainerId;
  }

  if (isTrainer(user)) {
    return user!.id;
  }

  return undefined;
}

function buildAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) {
    return null;
  }
  return storage.buildPublicUrl(avatarUrl);
}

function serializeMeasurement(record: Prisma.MeasurementRecordGetPayload<{ include: { assessment: true } }>) {
  return {
    id: record.id,
    trainerId: record.trainerId,
    clientId: record.clientId,
    assessmentId: record.assessmentId,
    recordedAt: record.recordedAt,
    weightKg: record.weightKg,
    heightCm: record.heightCm,
    bodyFat: record.bodyFat,
    muscleMass: record.muscleMass,
    chest: record.chest,
    waist: record.waist,
    hip: record.hip,
    thigh: record.thigh,
    bicep: record.bicep,
    forearm: record.forearm,
    calf: record.calf,
    neck: record.neck,
    notes: record.notes,
    data: record.data,
    assessment: record.assessment
      ? {
          id: record.assessment.id,
          status: record.assessment.status,
          performedAt: record.assessment.performedAt,
          scheduledFor: record.assessment.scheduledFor,
        }
      : null,
  };
}

export async function getAssessmentOverview(params: { user: AuthenticatedUser | undefined; trainerId?: string }) {
  const trainerScope = resolveTrainerScope(params.user, params.trainerId);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const assessmentWhere: Prisma.AssessmentWhereInput = {};
  if (trainerScope) {
    assessmentWhere.trainerId = trainerScope;
  }

  const [pendingAssessments, pendingToday, completedThisMonth, overdueAssessments, clientAssignments, assessedClients] =
    await prisma.$transaction([
      prisma.assessment.count({
        where: {
          ...assessmentWhere,
          status: AssessmentStatus.SCHEDULED,
        },
      }),
      prisma.assessment.count({
        where: {
          ...assessmentWhere,
          status: AssessmentStatus.SCHEDULED,
          scheduledFor: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.assessment.count({
        where: {
          ...assessmentWhere,
          status: AssessmentStatus.COMPLETED,
          performedAt: { gte: startOfMonth },
        },
      }),
      prisma.assessment.count({
        where: {
          ...assessmentWhere,
          status: AssessmentStatus.SCHEDULED,
          scheduledFor: { lt: startOfDay },
        },
      }),
      prisma.trainerClient.count({
        where: {
          status: { in: [TrainerClientStatus.ACTIVE, TrainerClientStatus.PAUSED] },
          ...(trainerScope ? { trainerId: trainerScope } : {}),
        },
      }),
      prisma.assessment.findMany({
        where: {
          ...assessmentWhere,
          status: AssessmentStatus.COMPLETED,
          performedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()) },
        },
        distinct: ['clientId'],
        select: { clientId: true },
      }),
    ]);

  return {
    pendingAssessments,
    pendingToday,
    completedThisMonth,
    overdueAssessments,
    totalClients: clientAssignments,
    assessedClients: assessedClients.length,
  };
}

export async function listAssessmentClients(params: {
  user: AuthenticatedUser | undefined;
  trainerId?: string;
  search?: string;
  status?: 'scheduled' | 'completed' | 'delayed' | 'all';
}) {
  const trainerScope = resolveTrainerScope(params.user, params.trainerId);
  const where: Prisma.TrainerClientWhereInput = {
    status: { in: [TrainerClientStatus.ACTIVE, TrainerClientStatus.PAUSED] },
  };
  if (trainerScope) {
    where.trainerId = trainerScope;
  }
  if (params.search) {
    where.client = {
      OR: [
        { name: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
      ],
    };
  }

  const assignments = await prisma.trainerClient.findMany({
    where,
    include: {
      client: { include: { clientProfile: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const clientIds = assignments.map((assignment) => assignment.clientId);
  if (!clientIds.length) {
    return [];
  }

  const [completedAssessments, scheduledAssessments, measurements] = await prisma.$transaction([
    prisma.assessment.findMany({
      where: {
        clientId: { in: clientIds },
        ...(trainerScope ? { trainerId: trainerScope } : {}),
        status: AssessmentStatus.COMPLETED,
      },
      orderBy: [{ performedAt: 'desc' }],
    }),
    prisma.assessment.findMany({
      where: {
        clientId: { in: clientIds },
        ...(trainerScope ? { trainerId: trainerScope } : {}),
        status: AssessmentStatus.SCHEDULED,
      },
      orderBy: [{ scheduledFor: 'asc' }],
    }),
    prisma.measurementRecord.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { recordedAt: 'desc' },
    }),
  ]);

  const latestCompletedMap = new Map<string, Prisma.Assessment>();
  const nextScheduledMap = new Map<string, Prisma.Assessment>();
  const measurementMap = new Map<string, Prisma.MeasurementRecord>();

  for (const assessment of completedAssessments) {
    if (!latestCompletedMap.has(assessment.clientId)) {
      latestCompletedMap.set(assessment.clientId, assessment);
    }
  }

  for (const assessment of scheduledAssessments) {
    const existing = nextScheduledMap.get(assessment.clientId);
    if (!existing || (existing.scheduledFor ?? new Date(0)) > (assessment.scheduledFor ?? new Date(0))) {
      nextScheduledMap.set(assessment.clientId, assessment);
    }
  }

  for (const measurement of measurements) {
    if (!measurementMap.has(measurement.clientId)) {
      measurementMap.set(measurement.clientId, measurement);
    }
  }

  const now = new Date();

  return assignments
    .map((assignment) => {
      const profile = assignment.client.clientProfile;
      const latestCompleted = latestCompletedMap.get(assignment.clientId) ?? null;
      const nextScheduled = nextScheduledMap.get(assignment.clientId) ?? null;
      const latestMeasurement = measurementMap.get(assignment.clientId) ?? null;

      let status: 'scheduled' | 'completed' | 'delayed' | 'pending';
      if (nextScheduled && nextScheduled.scheduledFor && nextScheduled.scheduledFor < now) {
        status = 'delayed';
      } else if (nextScheduled) {
        status = 'scheduled';
      } else if (latestCompleted) {
        status = 'completed';
      } else {
        status = 'pending';
      }

      return {
        assignmentId: assignment.id,
        clientId: assignment.clientId,
        name: assignment.client.name,
        email: assignment.client.email,
        avatarUrl: buildAvatarUrl(assignment.client.avatarUrl),
        status,
        lastAssessment: latestCompleted?.performedAt ?? null,
        nextAssessment: nextScheduled?.scheduledFor ?? profile?.nextAssessmentAt ?? null,
        goals: profile?.goals ?? [],
        progressPercentage: profile?.progressPercentage ?? 0,
        trainerId: assignment.trainerId,
        measurement: latestMeasurement
          ? {
              recordedAt: latestMeasurement.recordedAt,
              weightKg: latestMeasurement.weightKg,
              heightCm: latestMeasurement.heightCm,
              bodyFat: latestMeasurement.bodyFat,
              muscleMass: latestMeasurement.muscleMass,
              waist: latestMeasurement.waist,
            }
          : {
              weightKg: profile?.weightKg ?? null,
              heightCm: profile?.heightCm ?? null,
              bodyFat: null,
              muscleMass: null,
              waist: null,
              recordedAt: null,
            },
      };
    })
    .filter((client) => {
      if (!params.status || params.status === 'all') {
        return true;
      }
      return client.status === params.status;
    });
}

export async function listAssessmentTemplates(params: { user: AuthenticatedUser | undefined; trainerId?: string }) {
  const trainerScope = resolveTrainerScope(params.user, params.trainerId);

  const templates = await prisma.assessmentTemplate.findMany({
    where: {
      OR: [{ isDefault: true }, ...(trainerScope ? [{ trainerId: trainerScope }] : [])],
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    type: template.type,
    metrics: template.metrics,
    isDefault: template.isDefault,
  }));
}

export async function createAssessment(params: { user: AuthenticatedUser | undefined; data: AssessmentPayload }) {
  ensureTrainerOrAdmin(params.user);
  const trainerId = isTrainer(params.user) ? params.user!.id : params.user?.id ?? params.data.clientId;

  const client = await prisma.user.findUnique({ where: { id: params.data.clientId } });
  if (!client) {
    throw createHttpError(404, 'Cliente não encontrado');
  }

  if (!isAdmin(params.user)) {
    await ensureClientAssignment(params.user, params.data.clientId);
  }

  const scheduledFor = params.data.scheduledFor ? new Date(params.data.scheduledFor) : null;

  const assessment = await prisma.assessment.create({
    data: {
      id: randomUUID(),
      trainerId: trainerId!,
      clientId: params.data.clientId,
      templateId: params.data.templateId ?? undefined,
      status: scheduledFor ? AssessmentStatus.SCHEDULED : AssessmentStatus.DRAFT,
      type: params.data.type ?? undefined,
      scheduledFor,
      notes: params.data.notes ?? undefined,
    },
  });

  if (scheduledFor) {
    await prisma.clientProfile.updateMany({
      where: { userId: params.data.clientId },
      data: { nextAssessmentAt: scheduledFor },
    });
  }

  await createNotification({
    userId: params.data.clientId,
    category: NotificationCategory.ASSESSMENT,
    priority: NotificationPriority.NORMAL,
    title: scheduledFor
      ? 'Nova avaliação física agendada'
      : 'Avaliação física registrada',
    message: scheduledFor
      ? `Sua avaliação está agendada para ${scheduledFor.toLocaleString('pt-BR')}.`
      : 'Uma nova avaliação foi adicionada ao seu histórico.',
    data: { assessmentId: assessment.id, scheduledFor },
    emailFallback: Boolean(scheduledFor),
  });

  return assessment;
}

export async function updateAssessment(params: {
  user: AuthenticatedUser | undefined;
  assessmentId: string;
  data: CompleteAssessmentPayload;
}) {
  ensureTrainerOrAdmin(params.user);

  const existing = await prisma.assessment.findUnique({ where: { id: params.assessmentId } });
  if (!existing) {
    throw createHttpError(404, 'Avaliação não encontrada');
  }

  if (!isAdmin(params.user) && existing.trainerId !== params.user!.id) {
    throw createHttpError(403, 'Você não possui permissão para alterar esta avaliação');
  }

  const payload: Prisma.AssessmentUpdateInput = {};

  if (params.data.status) {
    payload.status = params.data.status;
  }
  if (params.data.performedAt !== undefined) {
    payload.performedAt = params.data.performedAt ? new Date(params.data.performedAt) : null;
  }
  if (params.data.metrics !== undefined) {
    payload.metrics =
      params.data.metrics === null
        ? Prisma.JsonNull
        : (params.data.metrics as Prisma.InputJsonValue);
  }
  if (params.data.notes !== undefined) {
    payload.notes = params.data.notes;
  }

  const updated = await prisma.assessment.update({
    where: { id: params.assessmentId },
    data: payload,
  });

  if (updated.status === AssessmentStatus.COMPLETED && updated.performedAt) {
    await prisma.clientProfile.updateMany({
      where: { userId: updated.clientId },
      data: { nextAssessmentAt: null },
    });
    await createNotification({
      userId: updated.clientId,
      category: NotificationCategory.ASSESSMENT,
      priority: NotificationPriority.HIGH,
      title: 'Avaliação concluída',
      message: 'Sua avaliação física foi concluída e os resultados já estão disponíveis.',
      data: { assessmentId: updated.id },
      emailFallback: true,
    });
  }

  return updated;
}

export async function listAssessmentHistory(params: {
  user: AuthenticatedUser | undefined;
  trainerId?: string;
  clientId?: string;
  limit?: number;
}) {
  const trainerScope = resolveTrainerScope(params.user, params.trainerId);
  const where: Prisma.AssessmentWhereInput = {
    status: { in: [AssessmentStatus.COMPLETED, AssessmentStatus.SCHEDULED] },
  };

  if (trainerScope) {
    where.trainerId = trainerScope;
  }
  if (params.clientId) {
    await ensureClientAssignment(params.user, params.clientId);
    where.clientId = params.clientId;
  }

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      client: true,
      template: true,
    },
    orderBy: [
      { performedAt: 'desc' },
      { scheduledFor: 'desc' },
      { createdAt: 'desc' },
    ],
    take: params.limit ?? 50,
  });

  return assessments.map((assessment) => ({
    id: assessment.id,
    status: assessment.status,
    performedAt: assessment.performedAt,
    scheduledFor: assessment.scheduledFor,
    notes: assessment.notes,
    metrics: assessment.metrics,
    client: {
      id: assessment.clientId,
      name: assessment.client.name,
      email: assessment.client.email,
      avatarUrl: buildAvatarUrl(assessment.client.avatarUrl),
    },
    template: assessment.template
      ? { id: assessment.template.id, name: assessment.template.name, type: assessment.template.type }
      : null,
  }));
}

export async function listMeasurementHistory(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
  limit?: number;
}) {
  await ensureClientAssignment(params.user, params.clientId);

  const measurements = await prisma.measurementRecord.findMany({
    where: { clientId: params.clientId },
    include: { assessment: true },
    orderBy: { recordedAt: 'desc' },
    take: params.limit ?? 50,
  });

  return measurements.map(serializeMeasurement);
}

export async function createMeasurementRecord(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
  assessmentId?: string | null;
  payload: {
    recordedAt?: Date | string;
    weightKg?: number | null;
    heightCm?: number | null;
    bodyFat?: number | null;
    muscleMass?: number | null;
    chest?: number | null;
    waist?: number | null;
    hip?: number | null;
    thigh?: number | null;
    bicep?: number | null;
    forearm?: number | null;
    calf?: number | null;
    neck?: number | null;
    notes?: string | null;
    data?: Record<string, unknown> | null;
  };
}) {
  await ensureClientAssignment(params.user, params.clientId);

  if (params.assessmentId) {
    const assessment = await prisma.assessment.findUnique({ where: { id: params.assessmentId } });
    if (!assessment) {
      throw createHttpError(404, 'Avaliação associada não encontrada');
    }
    if (!isAdmin(params.user) && assessment.trainerId !== params.user!.id) {
      throw createHttpError(403, 'Você não possui permissão para associar esta avaliação');
    }
  }

  const measurement = await prisma.measurementRecord.create({
    data: {
      id: randomUUID(),
      trainerId: params.user!.id,
      clientId: params.clientId,
      assessmentId: params.assessmentId ?? undefined,
      recordedAt: params.payload.recordedAt ? new Date(params.payload.recordedAt) : undefined,
      weightKg: params.payload.weightKg ?? undefined,
      heightCm: params.payload.heightCm ?? undefined,
      bodyFat: params.payload.bodyFat ?? undefined,
      muscleMass: params.payload.muscleMass ?? undefined,
      chest: params.payload.chest ?? undefined,
      waist: params.payload.waist ?? undefined,
      hip: params.payload.hip ?? undefined,
      thigh: params.payload.thigh ?? undefined,
      bicep: params.payload.bicep ?? undefined,
      forearm: params.payload.forearm ?? undefined,
      calf: params.payload.calf ?? undefined,
      neck: params.payload.neck ?? undefined,
      notes: params.payload.notes ?? undefined,
      data:
        params.payload.data === null
          ? Prisma.JsonNull
          : params.payload.data === undefined
          ? undefined
          : (params.payload.data as Prisma.InputJsonValue),
    },
    include: { assessment: true },
  });

  await prisma.clientProfile.updateMany({
    where: { userId: params.clientId },
    data: {
      weightKg: params.payload.weightKg ?? undefined,
      heightCm: params.payload.heightCm ?? undefined,
    },
  });

  return serializeMeasurement(measurement);
}

export async function listProgressPhotos(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
}) {
  await ensureClientAssignment(params.user, params.clientId);

  const photos = await prisma.progressPhoto.findMany({
    where: { clientId: params.clientId },
    orderBy: { capturedAt: 'desc' },
  });

  return photos.map((photo) => ({
    id: photo.id,
    capturedAt: photo.capturedAt,
    assessmentId: photo.assessmentId,
    url: storage.buildPublicUrl(photo.storagePath),
    filename: photo.filename,
    size: photo.size,
  }));
}

export async function saveProgressPhoto(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
  assessmentId?: string | null;
  file: Express.Multer.File | undefined;
  capturedAt?: string | Date | null;
}) {
  await ensureClientAssignment(params.user, params.clientId);

  if (!params.file) {
    throw createHttpError(400, 'Arquivo de imagem é obrigatório');
  }

  const relativePath = storage.relativeFromFile(params.file.path);

  const photo = await prisma.progressPhoto.create({
    data: {
      id: randomUUID(),
      trainerId: params.user!.id,
      clientId: params.clientId,
      assessmentId: params.assessmentId ?? undefined,
      capturedAt: params.capturedAt ? new Date(params.capturedAt) : undefined,
      storagePath: relativePath,
      filename: params.file.originalname ?? params.file.filename,
      mimeType: params.file.mimetype,
      size: params.file.size,
    },
  });

  return {
    id: photo.id,
    capturedAt: photo.capturedAt,
    assessmentId: photo.assessmentId,
    url: storage.buildPublicUrl(photo.storagePath),
    filename: photo.filename,
    size: photo.size,
  };
}

export async function listAssessmentAttachments(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
}) {
  await ensureClientAssignment(params.user, params.clientId);

  const attachments = await prisma.assessmentAttachment.findMany({
    where: { clientId: params.clientId },
    orderBy: { uploadedAt: 'desc' },
  });

  return attachments.map((attachment) => ({
    id: attachment.id,
    uploadedAt: attachment.uploadedAt,
    assessmentId: attachment.assessmentId,
    url: storage.buildPublicUrl(attachment.storagePath),
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
  }));
}

export async function saveAssessmentAttachment(params: {
  user: AuthenticatedUser | undefined;
  clientId: string;
  assessmentId?: string | null;
  file: Express.Multer.File | undefined;
}) {
  await ensureClientAssignment(params.user, params.clientId);

  if (!params.file) {
    throw createHttpError(400, 'Arquivo é obrigatório');
  }

  const relativePath = storage.relativeFromFile(params.file.path);

  const attachment = await prisma.assessmentAttachment.create({
    data: {
      id: randomUUID(),
      trainerId: params.user!.id,
      clientId: params.clientId,
      assessmentId: params.assessmentId ?? undefined,
      storagePath: relativePath,
      filename: params.file.originalname ?? params.file.filename,
      mimeType: params.file.mimetype,
      size: params.file.size,
    },
  });

  return {
    id: attachment.id,
    uploadedAt: attachment.uploadedAt,
    assessmentId: attachment.assessmentId,
    url: storage.buildPublicUrl(attachment.storagePath),
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
  };
}
