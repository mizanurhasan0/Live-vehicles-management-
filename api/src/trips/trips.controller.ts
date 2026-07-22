import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/jwt-payload.type';
import { TripQueryDto } from './dto/trip.dto';
import { TripsService } from './trips.service';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private service: TripsService) {}

  @Roles(Role.DRIVER)
  @Post('start')
  start(@CurrentUser() user: AuthUser) {
    return this.service.start(user);
  }

  @Roles(Role.DRIVER)
  @Post(':id/end')
  end(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.end(user, id);
  }

  @Roles(Role.DRIVER)
  @Get('active')
  active(@CurrentUser() user: AuthUser) {
    return this.service.getActive(user);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: TripQueryDto) {
    return this.service.findAll(user.madrasaId, query);
  }
}
