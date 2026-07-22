import {
  Body,
  Controller,
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
import { CreateGuardianDto, UpdateGuardianDto } from './dto/guardian.dto';
import { GuardiansService } from './guardians.service';

@ApiTags('Guardians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('guardians')
export class GuardiansController {
  constructor(private service: GuardiansService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGuardianDto) {
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
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.service.update(user.madrasaId, id, dto);
  }
}
