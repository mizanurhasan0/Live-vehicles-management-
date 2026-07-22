import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NOTIFICATION_QUEUE,
  NotificationProcessor,
} from './notification.processor';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get('app.redisUrl') },
      }),
    }),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService, BullModule],
})
export class NotificationsModule {}
