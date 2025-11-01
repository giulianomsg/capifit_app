import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import createHttpError from 'http-errors';

import { env } from '@config/env';

const rootDir = process.cwd();

const baseDir = (() => {
  if (env.FILE_STORAGE_DRIVER === 'local') {
    if (env.FILE_STORAGE_LOCAL_PATH) {
      return path.isAbsolute(env.FILE_STORAGE_LOCAL_PATH)
        ? env.FILE_STORAGE_LOCAL_PATH
        : path.resolve(rootDir, env.FILE_STORAGE_LOCAL_PATH);
    }
    return path.resolve(rootDir, 'storage');
  }

  throw createHttpError(500, 'S3 storage driver is not implemented yet');
})();

const directories = {
  avatars: path.join(baseDir, 'avatars'),
  progressPhotos: path.join(baseDir, 'progress-photos'),
  assessmentDocs: path.join(baseDir, 'assessment-docs'),
  nutritionDocs: path.join(baseDir, 'nutrition-docs'),
};

async function ensureDirectories() {
  await fs.mkdir(baseDir, { recursive: true });
  for (const dir of Object.values(directories)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

void ensureDirectories();

function normalizeRelativePath(relativePath: string) {
  return relativePath.replace(/\\/g, '/');
}

function buildPublicUrl(relativePath: string) {
  const cleaned = normalizeRelativePath(relativePath).replace(/^\/+/, '');
  return `${env.API_BASE_URL.replace(/\/$/, '')}/uploads/${cleaned}`;
}

function resolveAbsolutePath(relativePath: string) {
  const sanitized = relativePath.replace(/\.\.+/g, '').replace(/^\/+/, '');
  return path.join(baseDir, sanitized);
}

function relativeFromFile(filePath: string) {
  const relative = path.relative(baseDir, filePath);
  return normalizeRelativePath(relative);
}

function generateFilename(originalName: string) {
  const extension = path.extname(originalName) || '.bin';
  return `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
}

export const storage = {
  baseDir,
  directories,
  buildPublicUrl,
  resolveAbsolutePath,
  relativeFromFile,
  generateFilename,
  async removeFile(relativePath: string | null | undefined) {
    if (!relativePath) {
      return;
    }

    const filePath = resolveAbsolutePath(relativePath);
    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  },
};

export type StorageDirectories = typeof directories;
export type StorageConfig = typeof storage;
