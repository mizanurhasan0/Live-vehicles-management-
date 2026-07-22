import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto, UpdateGuardianDto } from './dto/guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService) {}

  async create(madrasaId: string, dto: CreateGuardianDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          password: hash,
          role: Role.GUARDIAN,
          madrasaId,
        },
      });
      return tx.guardian.create({
        data: { userId: user.id, madrasaId, address: dto.address },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          students: true,
        },
      });
    });
  }

  async findAll(madrasaId: string, query: PaginationDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.guardian.findMany({
        where: { madrasaId },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          students: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guardian.count({ where: { madrasaId } }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(madrasaId: string, id: string) {
    const item = await this.prisma.guardian.findFirst({
      where: { id, madrasaId },
      include: { user: true, students: { include: { vehicle: true } } },
    });
    if (!item) throw new NotFoundException('Guardian not found');
    return item;
  }

  async update(madrasaId: string, id: string, dto: UpdateGuardianDto) {
    const guardian = await this.findOne(madrasaId, id);
    const { password, name, phone, email, address } = dto;
    const userData: Record<string, string> = {};
    if (name) userData.name = name;
    if (phone) userData.phone = phone;
    if (email !== undefined) userData.email = email;
    if (password) userData.password = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length) {
        await tx.user.update({
          where: { id: guardian.userId },
          data: userData,
        });
      }
      return tx.guardian.update({
        where: { id },
        data: { address },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          students: true,
        },
      });
    });
  }
}
