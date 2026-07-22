import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, TripStatus, type LocationLog } from '@prisma/client';
import { AuthUser } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LocationDto } from './dto/tracking.dto';
import { OsrmService } from './osrm.service';
import { PhoneGpsSource } from './phone-gps.source';
import { LocationBroadcastService } from './location-broadcast.service';
import {
  parseCachedLocation,
  VehicleLocation,
} from './types/vehicle-location.type';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private phoneGps: PhoneGpsSource,
    private osrm: OsrmService,
    private locationBroadcast: LocationBroadcastService,
  ) {}

  async postLocation(user: AuthUser, dto: LocationDto) {
    if (user.role !== Role.DRIVER || !user.driverId) {
      throw new ForbiddenException('Driver only');
    }
    const trip = await this.prisma.trip.findFirst({
      where: { driverId: user.driverId, status: TripStatus.STARTED },
      include: { vehicle: true },
    });
    if (!trip) throw new NotFoundException('No active trip');

    const payload = {
      ...dto,
      vehicleId: trip.vehicleId,
      tripId: trip.id,
      madrasaId: user.madrasaId,
      driverId: user.driverId,
    };
    await this.phoneGps.ingest(payload);
    await this.locationBroadcast.broadcastLocation(payload);
    return { message: 'Location updated', vehicleId: trip.vehicleId };
  }

  async getAllLive(user: AuthUser) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException();
    const vehicles = await this.prisma.vehicle.findMany({
      where: { madrasaId: user.madrasaId, status: { not: 'INACTIVE' } },
      include: {
        route: { select: { name: true } },
        driver: {
          select: {
            licenseNo: true,
            user: { select: { name: true, phone: true, photoUrl: true } },
          },
        },
      },
    });
    return Promise.all(
      vehicles.map(async (v) => ({
        vehicle: v,
        location: await this.resolveVehicleLocation(v.id),
      })),
    );
  }

  async getVehicleLive(user: AuthUser, vehicleId: string) {
    await this.assertVehicleAccess(user, vehicleId);
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, madrasaId: user.madrasaId },
      include: {
        driver: { include: { user: true } },
        route: { select: { name: true } },
      },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const location = await this.resolveVehicleLocation(vehicleId);

    return { vehicle, location };
  }

  async getEta(user: AuthUser, vehicleId: string, studentId?: string) {
    await this.assertVehicleAccess(user, vehicleId);
    const location = await this.getCachedLocation(vehicleId);
    if (!location) throw new NotFoundException('No live location');

    let destLat: number;
    let destLng: number;
    if (studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, vehicleId, madrasaId: user.madrasaId },
      });
      if (!student?.pickupLat || !student?.pickupLng) {
        throw new NotFoundException('Student pickup coordinates missing');
      }
      destLat = student.pickupLat;
      destLng = student.pickupLng;
    } else {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          route: { include: { stops: { orderBy: { order: 'asc' }, take: 1 } } },
        },
      });
      const stop = vehicle?.route?.stops[0];
      if (!stop) throw new NotFoundException('No route stop found');
      destLat = stop.lat;
      destLng = stop.lng;
    }

    const route = await this.osrm.getRoute(
      location.lng,
      location.lat,
      destLng,
      destLat,
    );
    if (route) return { ...route, estimated: false };

    const km = this.haversineKm(location.lat, location.lng, destLat, destLng);
    const minutes = Math.ceil((km / 25) * 60);
    return {
      distanceText: `${km.toFixed(1)} km`,
      durationText: `${minutes} mins`,
      durationMinutes: minutes,
      estimated: true,
      source: 'haversine' as const,
    };
  }

  /** Live GPS only: Redis cache or logs from an active trip. */
  private async resolveVehicleLocation(
    vehicleId: string,
  ): Promise<VehicleLocation | null> {
    const cached = await this.getCachedLocation(vehicleId);
    if (cached) return cached;

    const activeLog = await this.prisma.locationLog.findFirst({
      where: { trip: { vehicleId, status: TripStatus.STARTED } },
      orderBy: { createdAt: 'desc' },
    });
    if (activeLog) return this.locationFromLog(activeLog, vehicleId);

    return null;
  }

  private async getCachedLocation(
    vehicleId: string,
  ): Promise<VehicleLocation | null> {
    const raw = await this.redis.client.get(
      this.redis.vehicleLocationKey(vehicleId),
    );
    if (!raw) return null;
    return parseCachedLocation(raw);
  }

  private locationFromLog(
    log: LocationLog,
    vehicleId: string,
  ): VehicleLocation {
    return {
      lat: log.lat,
      lng: log.lng,
      speed: log.speed ?? undefined,
      heading: log.heading ?? undefined,
      vehicleId,
      source: log.source,
      timestamp: log.createdAt.toISOString(),
    };
  }

  private async assertVehicleAccess(user: AuthUser, vehicleId: string) {
    if (user.role === Role.ADMIN) return;
    if (user.role === Role.GUARDIAN && user.guardianId) {
      const student = await this.prisma.student.findFirst({
        where: { guardianId: user.guardianId, vehicleId },
      });
      if (student) return;
    }
    if (user.role === Role.DRIVER && user.driverId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: vehicleId, driverId: user.driverId },
      });
      if (vehicle) return;
    }
    throw new ForbiddenException();
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
