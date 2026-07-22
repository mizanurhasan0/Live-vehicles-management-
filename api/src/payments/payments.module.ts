import { Module } from '@nestjs/common';
import { BkashService } from './bkash.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, BkashService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
