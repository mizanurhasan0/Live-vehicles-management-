import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(
    madrasaId: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: {
        madrasaId,
        userId,
        type,
        title,
        message,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }

  findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.notification.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
