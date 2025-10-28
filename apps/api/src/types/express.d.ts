import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      } & Pick<User, 'email' | 'name' | 'status'>;
      cookies: Record<string, string>;
      refreshTokenId?: string;
    }
  }
}

export {};
