import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(madrasaId: string, dto: CreateDriverDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          password: hash,
          role: Role.DRIVER,
          madrasaId,
        },
      });
      return tx.driver.create({
        data: {
          userId: user.id,
          madrasaId,
          licenseNo: dto.licenseNo,
          address: dto.address,
        },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      });
    });
  }

  async findAll(madrasaId: string, query: PaginationDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { madrasaId },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              isActive: true,
            },
          },
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { madrasaId } }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(madrasaId: string, id: string) {
    const item = await this.prisma.driver.findFirst({
      where: { id, madrasaId },
      include: { user: true, vehicle: true },
    });
    if (!item) throw new NotFoundException('Driver not found');
    return item;
  }

  async update(madrasaId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.findOne(madrasaId, id);
    const { password, name, phone, email, ...rest } = dto;
    const userData: Record<string, string> = {};
    if (name) userData.name = name;
    if (phone) userData.phone = phone;
    if (email !== undefined) userData.email = email;
    if (password) userData.password = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length) {
        await tx.user.update({ where: { id: driver.userId }, data: userData });
      }
      return tx.driver.update({
        where: { id },
        data: rest,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          vehicle: true,
        },
      });
    });
  }
}
