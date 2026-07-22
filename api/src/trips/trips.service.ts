import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, TripStatus, VehicleStatus } from '@prisma/client';
import { paginate } from '../common/dto/pagination.dto';
import { AuthUser } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { TripQueryDto } from './dto/trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async start(user: AuthUser) {
    if (user.role !== Role.DRIVER || !user.driverId) {
      throw new ForbiddenException('Driver only');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { driverId: user.driverId, madrasaId: user.madrasaId },
    });
    if (!vehicle) throw new BadRequestException('No vehicle assigned');
    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw new BadRequestException('Trip already active');
    }

    const active = await this.prisma.trip.findFirst({
      where: { driverId: user.driverId, status: TripStatus.STARTED },
    });
    if (active) return active;

    return this.prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.ON_TRIP },
      });
      return tx.trip.create({
        data: {
          madrasaId: user.madrasaId,
          vehicleId: vehicle.id,
          driverId: user.driverId!,
        },
        include: { vehicle: true, driver: { include: { user: true } } },
      });
    });
  }

  async end(user: AuthUser, tripId: string) {
    const trip = await this.getDriverTrip(user, tripId);
    if (trip.status !== TripStatus.STARTED) {
      throw new BadRequestException('Trip not active');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.ACTIVE },
      });
      return tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED, endedAt: new Date() },
      });
    });
  }

  async getActive(user: AuthUser) {
    if (user.role !== Role.DRIVER || !user.driverId) {
      throw new ForbiddenException('Driver only');
    }
    return this.prisma.trip.findFirst({
      where: { driverId: user.driverId, status: TripStatus.STARTED },
      include: {
        vehicle: true,
        locationLogs: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findAll(madrasaId: string, query: TripQueryDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const where = {
      madrasaId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take,
        include: {
          vehicle: true,
          driver: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  private async getDriverTrip(user: AuthUser, tripId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, madrasaId: user.madrasaId },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (user.role === Role.DRIVER && trip.driverId !== user.driverId) {
      throw new ForbiddenException();
    }
    return trip;
  }
}
