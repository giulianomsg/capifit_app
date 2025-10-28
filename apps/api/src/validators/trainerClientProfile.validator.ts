import { z } from 'zod';

const profileBody = z.object({
  trainerId: z.coerce.number().int().positive(),
  clientId: z.coerce.number().int().positive(),
  goals: z.string().max(1000).optional(),
  injuries: z.string().max(1000).optional(),
  preferences: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional()
});

export const createTrainerClientProfileSchema = z.object({
  body: profileBody
});

export const updateTrainerClientProfileSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: profileBody.partial()
});

export const listTrainerClientProfileSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
    trainerId: z.string().regex(/^\d+$/).optional(),
    search: z.string().max(255).optional()
  })
});

export const getOrDeleteTrainerClientProfileSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});
