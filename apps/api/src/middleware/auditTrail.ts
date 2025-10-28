import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const createAuditEntry = async (
  entity: string,
  entityId: number,
  action: string,
  changes: Record<string, unknown> | null,
  performedBy?: string,
  profileId?: number
) => {
  await prisma.auditTrail.create({
    data: {
      entity,
      entityId,
      action,
      changes,
      performedBy,
      profileId
    }
  });
};

export const withAuditTrail = (
  entity: string,
  action: string,
  resolveEntityId: (req: Request, res: Response) => number | undefined,
  resolveChanges?: (req: Request, res: Response) => Record<string, unknown> | null,
  resolveProfileId?: (req: Request, res: Response) => number | undefined
) =>
  async (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      if (res.statusCode < 200 || res.statusCode >= 400) {
        return;
      }
      const entityId = resolveEntityId(req, res);
      if (typeof entityId === 'undefined') {
        return;
      }
      const changes = resolveChanges?.(req, res) ?? null;
      const profileId = resolveProfileId?.(req, res);
      await createAuditEntry(entity, entityId, action, changes, req.userId as string | undefined, profileId);
    });

    next();
  };
