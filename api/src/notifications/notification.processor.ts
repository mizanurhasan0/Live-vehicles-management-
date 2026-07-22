import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';

export const NOTIFICATION_QUEUE = 'notifications';

export type NotificationJob = {
  madrasaId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  constructor(private notifications: NotificationsService) {
    super();
  }

  process(job: Job<NotificationJob>) {
    const { madrasaId, userId, type, title, message, metadata } = job.data;
    return this.notifications.create(
      madrasaId,
      userId,
      type,
      title,
      message,
      metadata,
    );
  }
}
