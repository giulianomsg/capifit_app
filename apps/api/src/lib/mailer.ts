import nodemailer from 'nodemailer';

import { env } from '@config/env';
import { logger } from '@utils/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

transporter.verify().catch((error) => {
  logger.warn({ error }, 'SMTP transporter verification failed');
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(options: SendMailOptions) {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      ...options,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send e-mail');
    throw error;
  }
}
