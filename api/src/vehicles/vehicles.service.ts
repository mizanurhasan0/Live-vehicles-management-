import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  create(madrasaId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: { ...dto, madrasaId } });
  }

  async findAll(madrasaId: string, query: PaginationDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { madrasaId },
        skip,
        take,
        include: {
          driver: {
            include: { user: { select: { name: true, phone: true } } },
          },
          route: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { madrasaId } }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(madrasaId: string, id: string) {
    const item = await this.prisma.vehicle.findFirst({
      where: { id, madrasaId },
      include: {
        driver: { include: { user: true } },
        route: { include: { stops: true } },
        students: true,
      },
    });
    if (!item) throw new NotFoundException('Vehicle not found');
    return item;
  }

  async update(madrasaId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(madrasaId, id);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(madrasaId: string, id: string) {
    await this.findOne(madrasaId, id);
    return this.prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
