import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto, RouteStopDto, UpdateRouteDto } from './dto/route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  create(madrasaId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        madrasaId,
        stops: { create: dto.stops },
      },
      include: { stops: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(madrasaId: string, query: PaginationDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { madrasaId },
        skip,
        take,
        include: { stops: { orderBy: { order: 'asc' } }, vehicles: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { madrasaId } }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(madrasaId: string, id: string) {
    const item = await this.prisma.route.findFirst({
      where: { id, madrasaId },
      include: { stops: { orderBy: { order: 'asc' } }, vehicles: true },
    });
    if (!item) throw new NotFoundException('Route not found');
    return item;
  }

  async update(madrasaId: string, id: string, dto: UpdateRouteDto) {
    await this.findOne(madrasaId, id);
    const { stops, ...rest } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (stops) {
        await tx.routeStop.deleteMany({ where: { routeId: id } });
        await tx.routeStop.createMany({
          data: stops.map((s: RouteStopDto) => ({ ...s, routeId: id })),
        });
      }
      return tx.route.update({
        where: { id },
        data: rest,
        include: { stops: { orderBy: { order: 'asc' } } },
      });
    });
  }

  async remove(madrasaId: string, id: string) {
    await this.findOne(madrasaId, id);
    return this.prisma.route.delete({ where: { id } });
  }
}
