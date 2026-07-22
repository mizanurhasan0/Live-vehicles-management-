import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthUser } from '../common/types/jwt-payload.type';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('vehicles')
export class VehiclesController {
  constructor(private service: VehiclesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVehicleDto) {
    return this.service.create(user.madrasaId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    return this.service.findAll(user.madrasaId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.madrasaId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.service.update(user.madrasaId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.madrasaId, id);
  }
}
