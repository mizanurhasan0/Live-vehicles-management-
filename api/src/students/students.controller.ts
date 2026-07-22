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
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStudentDto) {
    return this.service.create(user.madrasaId, dto);
  }

  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    return this.service.findAll(user, query);
  }

  @Roles(Role.ADMIN, Role.GUARDIAN)
  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user, id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.service.update(user.madrasaId, id, dto);
  }
}
