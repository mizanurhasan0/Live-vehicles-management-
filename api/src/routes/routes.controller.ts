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
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
import { RoutesService } from './routes.service';

@ApiTags('Routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('routes')
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRouteDto) {
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
    @Body() dto: UpdateRouteDto,
  ) {
    return this.service.update(user.madrasaId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.madrasaId, id);
  }
}
