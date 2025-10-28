import { prisma } from '../lib/prisma';
import { TrainerClientProfileRepository } from '../repositories/trainerClientProfile.repository';
import { Prisma } from '@prisma/client';

export const TrainerClientProfileService = {
  async create(payload: Prisma.TrainerClientProfileUncheckedCreateInput) {
    const profile = await TrainerClientProfileRepository.create(payload);
    return profile;
  },

  async list(params: { page?: number; pageSize?: number; trainerId?: number; search?: string }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    return TrainerClientProfileRepository.findMany({
      page,
      pageSize,
      trainerId: params.trainerId,
      search: params.search
    });
  },

  async getById(id: number) {
    return TrainerClientProfileRepository.findById(id);
  },

  async update(id: number, payload: Prisma.TrainerClientProfileUncheckedUpdateInput) {
    return TrainerClientProfileRepository.update(id, payload);
  },

  async remove(id: number) {
    return prisma.$transaction(async (tx) => {
      await TrainerClientProfileRepository.delete(id, tx);
      return id;
    });
  }
};
