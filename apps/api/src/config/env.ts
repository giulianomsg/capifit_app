import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_BASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.coerce.number().default(900),
  JWT_REFRESH_TTL: z.coerce.number().default(1209600),
  PASSWORD_SALT_ROUNDS: z.coerce.number().min(10).default(12),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  ENABLE_EMAIL_NOTIFICATIONS: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .default('true')
    .transform((value) => {
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
  FILE_STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  FILE_STORAGE_LOCAL_PATH: z.string().optional(),
  FILE_STORAGE_S3_BUCKET: z.string().optional(),
  FILE_STORAGE_S3_REGION: z.string().optional(),
  FILE_STORAGE_S3_ENDPOINT: z.string().optional(),
  FILE_STORAGE_S3_ACCESS_KEY: z.string().optional(),
  FILE_STORAGE_S3_SECRET_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  WEBSOCKET_PATH: z.string().default('/socket.io'),
  WEBSOCKET_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    }),
  NOTIFICATION_WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(3),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;
