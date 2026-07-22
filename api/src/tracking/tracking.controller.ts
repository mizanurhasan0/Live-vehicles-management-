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
import { EtaQueryDto, LocationDto } from './dto/tracking.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private service: TrackingService) {}

  @Roles(Role.DRIVER)
  @Post('location')
  postLocation(@CurrentUser() user: AuthUser, @Body() dto: LocationDto) {
    return this.service.postLocation(user, dto);
  }

  @Roles(Role.ADMIN)
  @Get('vehicles')
  allLive(@CurrentUser() user: AuthUser) {
    return this.service.getAllLive(user);
  }

  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get('vehicles/:id')
  vehicleLive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getVehicleLive(user, id);
  }

  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get('vehicles/:id/eta')
  eta(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query() query: EtaQueryDto,
  ) {
    return this.service.getEta(user, id, query.studentId);
  }
}
