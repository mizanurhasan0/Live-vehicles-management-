import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/jwt-payload.type';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('income')
  @ApiQuery({ name: 'month', example: '2026-07' })
  income(@CurrentUser() user: AuthUser, @Query('month') month: string) {
    return this.service.income(user.madrasaId, month);
  }

  @Get('pending-payments')
  @ApiQuery({ name: 'month', example: '2026-07' })
  pending(@CurrentUser() user: AuthUser, @Query('month') month: string) {
    return this.service.pendingPayments(user.madrasaId, month);
  }

  @Get('vehicle-usage')
  vehicleUsage(@CurrentUser() user: AuthUser) {
    return this.service.vehicleUsage(user.madrasaId);
  }

  @Get('driver-activity')
  driverActivity(@CurrentUser() user: AuthUser) {
    return this.service.driverActivity(user.madrasaId);
  }
}
