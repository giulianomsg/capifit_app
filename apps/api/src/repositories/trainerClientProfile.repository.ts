import { prisma, PrismaTransaction } from '../lib/prisma';
import { Prisma } from '@prisma/client';

type Tx = PrismaTransaction | typeof prisma;

const resolveClient = (tx?: Tx) => tx ?? prisma;

export const TrainerClientProfileRepository = {
  create(data: Prisma.TrainerClientProfileUncheckedCreateInput, tx?: Tx) {
    return resolveClient(tx).trainerClientProfile.create({ data, include: includeConfig });
  },

  findMany(params: {
    page: number;
    pageSize: number;
    trainerId?: number;
    search?: string;
  }) {
    const { page, pageSize, trainerId, search } = params;
    const where: Prisma.TrainerClientProfileWhereInput = {};
    if (trainerId) {
      where.trainerId = trainerId;
    }
    if (search) {
      where.OR = [
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    return prisma.$transaction(async (txClient) => {
      const [data, total] = await Promise.all([
        txClient.trainerClientProfile.findMany({
          where,
          include: includeConfig,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        }),
        txClient.trainerClientProfile.count({ where })
      ]);

      return {
        data,
        total,
        page,
        pageSize
      };
    });
  },

  findById(id: number, tx?: Tx) {
    return resolveClient(tx).trainerClientProfile.findUnique({
      where: { id },
      include: includeConfig
    });
  },

  update(id: number, data: Prisma.TrainerClientProfileUncheckedUpdateInput, tx?: Tx) {
    return resolveClient(tx).trainerClientProfile.update({
      where: { id },
      data,
      include: includeConfig
    });
  },

  delete(id: number, tx?: Tx) {
    return resolveClient(tx).trainerClientProfile.delete({
      where: { id }
    });
  }
};

const includeConfig = {
  trainer: true,
  client: true
} satisfies Prisma.TrainerClientProfileInclude;
