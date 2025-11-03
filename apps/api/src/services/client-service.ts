import { randomBytes, randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import {
  ActivityLevel,
  PaymentStatus,
  Prisma,
  SubscriptionPlan,
  TrainerClientStatus,
} from '@prisma/client';

import { prisma } from '../lib/prisma';
import { recordAuditLog } from '../repositories/user-repository';

interface AuthenticatedUser {
  id: string;
  roles: string[];
  email: string;
  name: string;
}

interface ListClientsFilters {
  user: AuthenticatedUser;
  page: number;
  perPage: number;
  search?: string;
  subscriptionPlans?: SubscriptionPlan[];
  paymentStatuses?: PaymentStatus[];
  activityLevels?: ActivityLevel[];
  statuses?: TrainerClientStatus[];
  trainerId?: string;
}

interface CreateClientInput {
  user: AuthenticatedUser;
  trainerId?: string;
  data: {
    name: string;
    email: string;
    phone?: string;
    subscriptionPlan: SubscriptionPlan;
    paymentStatus: PaymentStatus;
    activityLevel: ActivityLevel;
    progressPercentage?: number;
    goals?: string[];
    experienceLevel?: string;
    gender?: string;
    notes?: string;
    medicalConditions?: string;
    dateOfBirth?: Date;
    nextAssessmentAt?: Date;
    lastWorkoutAt?: Date;
    sendInvitation?: boolean;
  };
}

interface UpdateClientInput {
  user: AuthenticatedUser;
  assignmentId: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    subscriptionPlan?: SubscriptionPlan;
    paymentStatus?: PaymentStatus;
    activityLevel?: ActivityLevel;
    progressPercentage?: number;
    goals?: string[];
    experienceLevel?: string;
    gender?: string;
    notes?: string;
    medicalConditions?: string;
    dateOfBirth?: Date;
    nextAssessmentAt?: Date;
    lastWorkoutAt?: Date;
    status?: TrainerClientStatus;
  };
}

interface RemoveClientInput {
  user: AuthenticatedUser;
  assignmentId: string;
}

const CLIENT_SELECT = {
  id: true,
  trainerId: true,
  clientId: true,
  status: true,
  startedAt: true,
  endedAt: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      avatarUrl: true,
      phone: true,
      createdAt: true,
      clientProfile: true,
    },
  },
  trainer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.TrainerClientSelect;

function hasRole(user: AuthenticatedUser, role: string) {
  return user.roles.includes(role);
}

function resolveTrainerContext(user: AuthenticatedUser, trainerId?: string) {
  if (hasRole(user, 'admin')) {
    return trainerId ?? null;
  }

  if (hasRole(user, 'trainer')) {
    if (trainerId && trainerId !== user.id) {
      throw createHttpError(403, 'Trainers can only manage their own clients');
    }
    return user.id;
  }

  throw createHttpError(403, 'Only trainers or administrators can manage clients');
}

function sanitizeGoals(goals?: string[]) {
  if (!goals) {
    return [];
  }
  return goals
    .map((goal) => goal.trim())
    .filter((goal, index, array) => goal.length > 0 && array.indexOf(goal) === index);
}

function sanitizeProgress(progress?: number) {
  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(progress)));
}

function serializeAssignment(assignment: Prisma.TrainerClientGetPayload<{ select: typeof CLIENT_SELECT }>) {
  return {
    id: assignment.id,
    trainerId: assignment.trainerId,
    clientId: assignment.clientId,
    status: assignment.status,
    startedAt: assignment.startedAt,
    endedAt: assignment.endedAt,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    client: assignment.client,
    trainer: assignment.trainer,
  };
}

function computeMetrics(assignments: Prisma.TrainerClientGetPayload<{ select: typeof CLIENT_SELECT }>[]) {
  const accumulator = {
    totalClients: assignments.length,
    activeClients: 0,
    pausedClients: 0,
    endedClients: 0,
    newThisMonth: 0,
    paymentStatus: {
      ON_TIME: 0,
      PENDING: 0,
      LATE: 0,
    },
    subscriptionDistribution: {
      MONTHLY: 0,
      QUARTERLY: 0,
      ANNUAL: 0,
      CUSTOM: 0,
    },
    activityLevels: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INACTIVE: 0,
    },
    averageProgress: 0,
  };

  let progressSum = 0;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  for (const assignment of assignments) {
    if (assignment.status === TrainerClientStatus.ACTIVE) accumulator.activeClients += 1;
    if (assignment.status === TrainerClientStatus.PAUSED) accumulator.pausedClients += 1;
    if (assignment.status === TrainerClientStatus.ENDED) accumulator.endedClients += 1;
    if (assignment.startedAt && assignment.startedAt >= monthStart) {
      accumulator.newThisMonth += 1;
    }

    const profile = assignment.client.clientProfile;
    if (profile) {
      accumulator.subscriptionDistribution[profile.subscriptionPlan] += 1;
      accumulator.paymentStatus[profile.paymentStatus] += 1;
      accumulator.activityLevels[profile.activityLevel] += 1;
      progressSum += profile.progressPercentage ?? 0;
    }
  }

  const averageProgress = assignments.length > 0 ? progressSum / assignments.length : 0;

  return {
    ...accumulator,
    averageProgress: Number(averageProgress.toFixed(2)),
  };
}

export async function listClients(filters: ListClientsFilters) {
  const { user, page, perPage, search, subscriptionPlans, paymentStatuses, activityLevels, statuses, trainerId } = filters;

  const resolvedTrainerId = resolveTrainerContext(user, trainerId);

  const where: Prisma.TrainerClientWhereInput = {
    trainer: { deletedAt: null },
    client: { deletedAt: null },
  };

  if (resolvedTrainerId) {
    where.trainerId = resolvedTrainerId;
  }

  if (statuses && statuses.length > 0) {
    where.status = { in: statuses };
  }

  const clientWhere: Prisma.UserWhereInput = { deletedAt: null };

  if (search) {
    clientWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const profileWhere: Prisma.ClientProfileWhereInput = {};

  if (subscriptionPlans && subscriptionPlans.length > 0) {
    profileWhere.subscriptionPlan = { in: subscriptionPlans };
  }

  if (paymentStatuses && paymentStatuses.length > 0) {
    profileWhere.paymentStatus = { in: paymentStatuses };
  }

  if (activityLevels && activityLevels.length > 0) {
    profileWhere.activityLevel = { in: activityLevels };
  }

  if (Object.keys(profileWhere).length > 0) {
    clientWhere.clientProfile = profileWhere;
  }

  where.client = clientWhere;

  const skip = (page - 1) * perPage;

  const [total, assignments, metricAssignments] = await prisma.$transaction([
    prisma.trainerClient.count({ where }),
    prisma.trainerClient.findMany({
      where,
      select: CLIENT_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.trainerClient.findMany({
      where,
      select: CLIENT_SELECT,
    }),
  ]);

  const metrics = computeMetrics(metricAssignments);
  const totalPages = total === 0 ? 1 : Math.ceil(total / perPage);

  return {
    data: assignments.map(serializeAssignment),
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
    metrics,
  };
}

export async function createClientAssignment(input: CreateClientInput) {
  const { user, trainerId, data } = input;
  const resolvedTrainerId = resolveTrainerContext(user, trainerId);

  if (!resolvedTrainerId) {
    throw createHttpError(400, 'Trainer context is required for administrators');
  }

  const trainer = await prisma.user.findFirst({ where: { id: resolvedTrainerId, deletedAt: null } });
  if (!trainer) {
    throw createHttpError(404, 'Trainer not found');
  }

  const clientRole = await prisma.role.findUnique({ where: { name: 'client' } });
  if (!clientRole) {
    throw createHttpError(500, 'Client role is not configured');
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: data.email },
    include: { roles: true, clientProfile: true },
  });

  if (existingUser && existingUser.deletedAt) {
    throw createHttpError(409, 'The e-mail is associated with an archived user');
  }

  const existingAssignment = existingUser
    ? await prisma.trainerClient.findUnique({
        where: { trainerId_clientId: { trainerId: resolvedTrainerId, clientId: existingUser.id } },
      })
    : null;

  if (existingAssignment) {
    throw createHttpError(409, 'Client is already assigned to this trainer');
  }

  const passwordSource = randomBytes(12).toString('hex');
  const passwordHash = await bcrypt.hash(passwordSource, 12);

  const createdAssignment = await prisma.$transaction(async (tx) => {
    const client = existingUser
      ? await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: data.name,
            phone: data.phone,
            roles: existingUser.roles.some((role) => role.roleId === clientRole.id)
              ? undefined
              : {
                  create: { roleId: clientRole.id },
                },
            status: existingUser.status === 'INVITED' ? 'INVITED' : 'ACTIVE',
          },
        })
      : await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            status: data.sendInvitation === false ? 'ACTIVE' : 'INVITED',
            roles: {
              create: { roleId: clientRole.id },
            },
          },
        });

    const profileData: Prisma.ClientProfileUpsertArgs['create'] = {
      userId: client.id,
      subscriptionPlan: data.subscriptionPlan,
      paymentStatus: data.paymentStatus,
      progressPercentage: sanitizeProgress(data.progressPercentage),
      activityLevel: data.activityLevel,
      goals: sanitizeGoals(data.goals),
      experienceLevel: data.experienceLevel,
      gender: data.gender,
      notes: data.notes,
      medicalConditions: data.medicalConditions,
      dateOfBirth: data.dateOfBirth,
      nextAssessmentAt: data.nextAssessmentAt,
      lastWorkoutAt: data.lastWorkoutAt,
    };

    await tx.clientProfile.upsert({
      where: { userId: client.id },
      update: profileData,
      create: { ...profileData, id: randomUUID() },
    });

    const assignment = await tx.trainerClient.create({
      data: {
        trainerId: resolvedTrainerId,
        clientId: client.id,
        status: TrainerClientStatus.ACTIVE,
      },
      select: CLIENT_SELECT,
    });

    await recordAuditLog({
      userId: user.id,
      action: 'client.assign',
      entity: 'trainer_client',
      entityId: assignment.id,
      metadata: {
        trainerId: resolvedTrainerId,
        clientId: client.id,
      },
    });

    return assignment;
  });

  return serializeAssignment(createdAssignment);
}

export async function updateClientAssignment(input: UpdateClientInput) {
  const { user, assignmentId, data } = input;

  const assignment = await prisma.trainerClient.findFirst({
    where: { id: assignmentId },
    select: CLIENT_SELECT,
  });

  if (!assignment) {
    throw createHttpError(404, 'Client assignment not found');
  }

  const resolvedTrainerId = resolveTrainerContext(user, assignment.trainerId);
  if (resolvedTrainerId && assignment.trainerId !== resolvedTrainerId) {
    throw createHttpError(403, 'You do not have permission to modify this client');
  }

  const updates: Prisma.UserUpdateInput = {};

  if (data.name && data.name !== assignment.client.name) {
    updates.name = data.name;
  }

  if (data.phone !== undefined && data.phone !== assignment.client.phone) {
    updates.phone = data.phone;
  }

  if (data.email && data.email !== assignment.client.email) {
    const existingEmail = await prisma.user.findFirst({
      where: { email: data.email, id: { not: assignment.clientId } },
    });
    if (existingEmail) {
      throw createHttpError(409, 'Another user already uses this e-mail');
    }
    updates.email = data.email;
  }

  const profileUpdates: Prisma.ClientProfileUpsertArgs['update'] = {};

  if (data.subscriptionPlan) profileUpdates.subscriptionPlan = data.subscriptionPlan;
  if (data.paymentStatus) profileUpdates.paymentStatus = data.paymentStatus;
  if (data.activityLevel) profileUpdates.activityLevel = data.activityLevel;
  if (data.progressPercentage !== undefined) profileUpdates.progressPercentage = sanitizeProgress(data.progressPercentage);
  if (data.goals) profileUpdates.goals = sanitizeGoals(data.goals);
  if (data.experienceLevel !== undefined) profileUpdates.experienceLevel = data.experienceLevel;
  if (data.gender !== undefined) profileUpdates.gender = data.gender;
  if (data.notes !== undefined) profileUpdates.notes = data.notes;
  if (data.medicalConditions !== undefined) profileUpdates.medicalConditions = data.medicalConditions;
  if (data.dateOfBirth !== undefined) profileUpdates.dateOfBirth = data.dateOfBirth;
  if (data.nextAssessmentAt !== undefined) profileUpdates.nextAssessmentAt = data.nextAssessmentAt;
  if (data.lastWorkoutAt !== undefined) profileUpdates.lastWorkoutAt = data.lastWorkoutAt;

  const assignmentUpdate: Prisma.TrainerClientUpdateInput = {};
  if (data.status) {
    assignmentUpdate.status = data.status;
    assignmentUpdate.endedAt = data.status === TrainerClientStatus.ENDED ? new Date() : null;
  }

  const updatedAssignment = await prisma.$transaction(async (tx) => {
    if (Object.keys(updates).length > 0) {
      await tx.user.update({ where: { id: assignment.clientId }, data: updates });
    }

    if (Object.keys(profileUpdates).length > 0) {
      await tx.clientProfile.upsert({
        where: { userId: assignment.clientId },
        update: profileUpdates,
        create: {
          id: randomUUID(),
          userId: assignment.clientId,
          subscriptionPlan: data.subscriptionPlan ?? assignment.client.clientProfile?.subscriptionPlan ?? SubscriptionPlan.MONTHLY,
          paymentStatus: data.paymentStatus ?? assignment.client.clientProfile?.paymentStatus ?? PaymentStatus.ON_TIME,
          progressPercentage: sanitizeProgress(data.progressPercentage ?? assignment.client.clientProfile?.progressPercentage ?? 0),
          activityLevel: data.activityLevel ?? assignment.client.clientProfile?.activityLevel ?? ActivityLevel.MEDIUM,
          goals: sanitizeGoals(data.goals ?? assignment.client.clientProfile?.goals ?? []),
          experienceLevel: data.experienceLevel ?? assignment.client.clientProfile?.experienceLevel ?? undefined,
          gender: data.gender ?? assignment.client.clientProfile?.gender ?? undefined,
          notes: data.notes ?? assignment.client.clientProfile?.notes ?? undefined,
          medicalConditions: data.medicalConditions ?? assignment.client.clientProfile?.medicalConditions ?? undefined,
          dateOfBirth: data.dateOfBirth ?? assignment.client.clientProfile?.dateOfBirth ?? undefined,
          nextAssessmentAt: data.nextAssessmentAt ?? assignment.client.clientProfile?.nextAssessmentAt ?? undefined,
          lastWorkoutAt: data.lastWorkoutAt ?? assignment.client.clientProfile?.lastWorkoutAt ?? undefined,
        },
      });
    }

    if (Object.keys(assignmentUpdate).length > 0) {
      await tx.trainerClient.update({
        where: { id: assignment.id },
        data: assignmentUpdate,
      });
    }

    const refreshed = await tx.trainerClient.findUniqueOrThrow({
      where: { id: assignment.id },
      select: CLIENT_SELECT,
    });

    const metadata: Prisma.JsonValue = JSON.parse(
      JSON.stringify({
        trainerId: refreshed.trainerId,
        clientId: refreshed.clientId,
        updates: data,
      }),
    );

    await recordAuditLog({
      userId: user.id,
      action: 'client.update',
      entity: 'trainer_client',
      entityId: assignment.id,
      metadata,
    });

    return refreshed;
  });

  return serializeAssignment(updatedAssignment);
}

export async function removeClientAssignment(input: RemoveClientInput) {
  const { user, assignmentId } = input;

  const assignment = await prisma.trainerClient.findFirst({
    where: { id: assignmentId },
    select: CLIENT_SELECT,
  });

  if (!assignment) {
    throw createHttpError(404, 'Client assignment not found');
  }

  const resolvedTrainerId = resolveTrainerContext(user, assignment.trainerId);
  if (resolvedTrainerId && assignment.trainerId !== resolvedTrainerId) {
    throw createHttpError(403, 'You do not have permission to remove this client');
  }

  await prisma.$transaction(async (tx) => {
    await tx.trainerClient.update({
      where: { id: assignment.id },
      data: {
        status: TrainerClientStatus.ENDED,
        endedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: assignment.clientId },
      data: {
        status: 'INACTIVE',
      },
    });

    await recordAuditLog({
      userId: user.id,
      action: 'client.remove',
      entity: 'trainer_client',
      entityId: assignment.id,
      metadata: {
        trainerId: assignment.trainerId,
        clientId: assignment.clientId,
      },
    });
  });
}
