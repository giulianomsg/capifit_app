import type { Express, Request } from 'express';

import createHttpError from 'http-errors';
import multer from 'multer';
import path from 'node:path';

import { storage } from '@lib/storage';

function createDiskStorage(destination: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const filename = storage.generateFilename(file.originalname || 'file');
      cb(null, filename);
    },
  });
}

function createImageFilter(maxSizeMb = 5) {
  return function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(createHttpError(400, 'Somente imagens são permitidas para upload.'));
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExtensions.includes(extension)) {
      return cb(createHttpError(400, 'Formato de imagem não suportado.'));
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      return cb(createHttpError(400, `O arquivo excede o limite de ${maxSizeMb}MB.`));
    }

    return cb(null, true);
  };
}

function createDocumentFilter(allowed: string[]) {
  const normalized = allowed.map((ext) => ext.toLowerCase());
  return function documentFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!normalized.includes(extension)) {
      return cb(createHttpError(400, 'Formato de arquivo não suportado.'));
    }

    return cb(null, true);
  };
}

export const avatarUpload = multer({
  storage: createDiskStorage(storage.directories.avatars),
  fileFilter: createImageFilter(5),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const progressPhotoUpload = multer({
  storage: createDiskStorage(storage.directories.progressPhotos),
  fileFilter: createImageFilter(8),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const assessmentDocumentUpload = multer({
  storage: createDiskStorage(storage.directories.assessmentDocs),
  fileFilter: createDocumentFilter(['.pdf', '.jpg', '.jpeg', '.png']),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const nutritionAttachmentUpload = multer({
  storage: createDiskStorage(storage.directories.nutritionDocs),
  fileFilter: createDocumentFilter(['.pdf', '.jpg', '.jpeg', '.png']),
  limits: { fileSize: 10 * 1024 * 1024 },
});
