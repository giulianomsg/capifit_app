const normalizeBasePath = (segment: string) => {
  if (!segment) {
    return null;
  }

  const trimmed = segment.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed === '/') {
    return '/';
  }

  const normalized = trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
  return normalized ? `/${normalized}` : '/';
};

const basePathsFromEnv = process.env.API_BASE_PATHS
  ? process.env.API_BASE_PATHS.split(',').map((segment) => normalizeBasePath(segment)).filter((segment): segment is string => Boolean(segment))
  : [];

const defaultBasePaths = ['/api', '/'];

const apiBasePaths = Array.from(new Set([...basePathsFromEnv, ...defaultBasePaths]));

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3001),
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3001',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL ?? '',
  REDIS_URL: process.env.REDIS_URL ?? '',
  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  SMTP_FROM: process.env.SMTP_FROM ?? 'no-reply@example.com',
  WEBSOCKET_PATH: process.env.WEBSOCKET_PATH ?? '/socket.io',
  WEBSOCKET_ALLOWED_ORIGINS: process.env.WEBSOCKET_ALLOWED_ORIGINS ?? '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'dev-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev-secret',
  JWT_ACCESS_TTL: Number(process.env.JWT_ACCESS_TTL ?? 900),
  JWT_REFRESH_TTL: Number(process.env.JWT_REFRESH_TTL ?? 1209600),
  PASSWORD_SALT_ROUNDS: Number(process.env.PASSWORD_SALT_ROUNDS ?? 12),
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  NOTIFICATION_WORKER_CONCURRENCY: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY ?? 3),
  FILE_STORAGE_DRIVER: process.env.FILE_STORAGE_DRIVER ?? 'local',
  FILE_STORAGE_LOCAL_PATH: process.env.FILE_STORAGE_LOCAL_PATH ?? './storage',
  FILE_STORAGE_S3_BUCKET: process.env.FILE_STORAGE_S3_BUCKET ?? '',
  FILE_STORAGE_S3_REGION: process.env.FILE_STORAGE_S3_REGION ?? '',
  FILE_STORAGE_S3_ENDPOINT: process.env.FILE_STORAGE_S3_ENDPOINT ?? '',
  FILE_STORAGE_S3_ACCESS_KEY: process.env.FILE_STORAGE_S3_ACCESS_KEY ?? '',
  FILE_STORAGE_S3_SECRET_KEY: process.env.FILE_STORAGE_S3_SECRET_KEY ?? '',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 100),
  API_BASE_PATHS: apiBasePaths,
};
