import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/jwt-payload.type';
import {
  BkashCallbackDto,
  ExecutePaymentDto,
  InitiatePaymentDto,
  PaymentQueryDto,
} from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUARDIAN)
  @Post('initiate')
  initiate(@CurrentUser() user: AuthUser, @Body() dto: InitiatePaymentDto) {
    return this.service.initiate(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GUARDIAN)
  @Post('execute')
  execute(@CurrentUser() user: AuthUser, @Body() dto: ExecutePaymentDto) {
    return this.service.execute(user, dto.paymentId);
  }

  @Post('callback')
  callback(@Body() dto: BkashCallbackDto) {
    return this.service.callback(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaymentQueryDto) {
    return this.service.findAll(user, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get(':id/invoice')
  invoice(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.invoice(user, id);
  }
}
