import { InjectQueue } from '@nestjs/bullmq';
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthUser } from '../common/types/jwt-payload.type';
import { NOTIFICATION_QUEUE } from './notification.processor';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private service: NotificationsService,
    @InjectQueue(NOTIFICATION_QUEUE) private queue: Queue,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    return this.service.findAll(user.sub, query.page, query.limit);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.markRead(user.sub, id);
  }
}
