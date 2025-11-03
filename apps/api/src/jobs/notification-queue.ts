import { Queue, Worker, type JobsOptions } from 'bullmq';

import { env } from '@config/env';
import { getRedisClient } from '@lib/redis';
import { sendMail } from '@lib/mailer';
import { logger } from '@utils/logger';

const connection = getRedisClient();

export interface EmailNotificationJob {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const QUEUE_NAME = 'notifications:email';

let queue: Queue<EmailNotificationJob> | null = null;
let worker: Worker<EmailNotificationJob> | null = null;
let isStopping = false;
let queueReady: Promise<void> | null = null;
let queueReadyResolved = false;

function ensureInfrastructure() {
  if (!env.ENABLE_EMAIL_NOTIFICATIONS) {
    return null;
  }

  if (!connection) {
    return null;
  }

  if (!queue) {
    try {
      queue = new Queue<EmailNotificationJob>(QUEUE_NAME, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 50,
          removeOnFail: 200,
        },
      });

      queue.on('error', (error) => {
        logger.error({ error }, 'Notification queue error');
      });

      queueReadyResolved = false;

      queueReady = queue
        .waitUntilReady()
        .then(() => {
          queueReadyResolved = true;
          logger.info('Notification queue ready');
        })
        .catch((error) => {
          queueReadyResolved = false;
          logger.error({ error }, 'Notification queue failed to become ready');
        });
    } catch (error) {
      logger.error({ error }, 'Failed to initialize notification queue infrastructure');
      queue = null;
      queueReady = null;
      queueReadyResolved = false;
      return null;
    }
  }

  return queue;
}

export async function enqueueEmailNotification(job: EmailNotificationJob, options?: JobsOptions) {
  if (!env.ENABLE_EMAIL_NOTIFICATIONS) {
    logger.debug('Email notifications disabled by configuration');
    return;
  }

  const queueInstance = ensureInfrastructure();

  if (!queueInstance) {
    logger.warn('Notification queue unavailable. Delivering email synchronously.');
    await sendMail(job);
    return;
  }

  await queueInstance.add('send-email', job, options);
}

export function startNotificationWorker() {
  if (!env.ENABLE_EMAIL_NOTIFICATIONS) {
    logger.info('Email notifications disabled. Worker not started.');
    return;
  }

  const queueInstance = ensureInfrastructure();

  if (!queueInstance || !connection) {
    logger.warn('Notification worker not started. Redis connection missing.');
    return;
  }

  if (worker && worker.isRunning()) {
    logger.debug('Notification worker already running');
    return;
  }

  worker = new Worker<EmailNotificationJob>(
    QUEUE_NAME,
    async (job) => {
      await sendMail(job.data);
    },
    {
      connection,
      concurrency: env.NOTIFICATION_WORKER_CONCURRENCY,
    },
  );

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Notification e-mail sent');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error }, 'Notification worker failed');
  });

  worker.on('stalled', (jobId) => {
    logger.warn({ jobId }, 'Notification job stalled');
  });

  worker.on('error', (error) => {
    logger.error({ error }, 'Notification worker error');
  });

  void Promise.all([queueReady ?? Promise.resolve(), worker.waitUntilReady()])
    .then(() => {
      logger.info(
        {
          concurrency: env.NOTIFICATION_WORKER_CONCURRENCY,
        },
        'Notification worker ready',
      );
    })
    .catch((error) => {
      logger.error({ error }, 'Notification worker failed to become ready');
    });
}

export async function stopNotificationWorker() {
  if (isStopping) {
    return;
  }

  isStopping = true;

  try {
    if (worker) {
      await worker.close();
      logger.info('Notification worker stopped');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to stop notification worker');
  } finally {
    worker = null;
  }

  try {
    if (queue) {
      await queue.close();
      logger.info('Notification queue closed');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to close notification queue');
  } finally {
    queue = null;
    queueReady = null;
    queueReadyResolved = false;
    isStopping = false;
  }
}

export async function getNotificationQueueHealth() {
  const queueInstance = ensureInfrastructure();
  const redisStatus = connection ? connection.status : 'offline';

  const jobCounts = queueInstance
    ? await queueInstance.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed', 'paused')
    : {
        waiting: 0,
        active: 0,
        delayed: 0,
        completed: 0,
        failed: 0,
        paused: 0,
      };

  // BullMQ v5 removes QueueScheduler; expose legacy flag based on queue readiness.
  const schedulerRunning = queueReadyResolved;
  const workerRunning = worker?.isRunning() ?? false;

  const status = !env.ENABLE_EMAIL_NOTIFICATIONS
    ? 'disabled'
    : queueInstance && redisStatus === 'ready' && queueReadyResolved && workerRunning
    ? 'ready'
    : 'degraded';

  return {
    timestamp: new Date().toISOString(),
    queueName: QUEUE_NAME,
    isEnabled: env.ENABLE_EMAIL_NOTIFICATIONS,
    redisStatus,
    schedulerRunning,
    workerRunning,
    jobCounts,
    status,
  };
}
