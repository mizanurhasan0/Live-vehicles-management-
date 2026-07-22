import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import { AuthUser } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  create(madrasaId: string, dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: { ...dto, madrasaId },
      include: { guardian: { include: { user: true } }, vehicle: true },
    });
  }

  async findAll(user: AuthUser, query: PaginationDto) {
    const where =
      user.role === Role.GUARDIAN
        ? { madrasaId: user.madrasaId, guardianId: user.guardianId }
        : { madrasaId: user.madrasaId };
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take,
        include: { guardian: { include: { user: true } }, vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(user: AuthUser, id: string) {
    const item = await this.prisma.student.findFirst({
      where: { id, madrasaId: user.madrasaId },
      include: { guardian: { include: { user: true } }, vehicle: true },
    });
    if (!item) throw new NotFoundException('Student not found');
    if (user.role === Role.GUARDIAN && item.guardianId !== user.guardianId) {
      throw new ForbiddenException();
    }
    return item;
  }

  async update(madrasaId: string, id: string, dto: UpdateStudentDto) {
    await this.findOne({ sub: '', role: Role.ADMIN, madrasaId }, id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
      include: { guardian: true, vehicle: true },
    });
  }
}
