import type { Request } from 'express';

import createHttpError from 'http-errors';
import multer from 'multer';
import path from 'node:path';

import { storage } from '@lib/storage';

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storage.avatarDir);
  },
  filename: (_req, file, cb) => {
    const filename = storage.generateFilename(file.originalname || 'avatar');
    cb(null, filename);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(createHttpError(400, 'Only image uploads are permitted'));
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (!allowedExtensions.includes(extension)) {
    return cb(createHttpError(400, 'Unsupported image format'));
  }

  return cb(null, true);
}

export const avatarUpload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
