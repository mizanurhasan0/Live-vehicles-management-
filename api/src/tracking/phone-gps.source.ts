import { Injectable } from '@nestjs/common';
import { TripStatus, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LocationPayload } from './tracking-source.interface';

const LOCATION_CACHE_TTL_SEC = 300;

async function writeVehicleLocationCache(
  redis: RedisService,
  payload: LocationPayload,
  source: string,
) {
  await redis.client.setex(
    redis.vehicleLocationKey(payload.vehicleId),
    LOCATION_CACHE_TTL_SEC,
    JSON.stringify({
      ...payload,
      source,
      updatedAt: new Date().toISOString(),
    }),
  );
}

@Injectable()
export class PhoneGpsSource {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async ingest(payload: LocationPayload) {
    if (!payload.tripId) {
      throw new Error('Phone GPS requires an active trip');
    }

    await this.prisma.locationLog.create({
      data: {
        tripId: payload.tripId,
        lat: payload.lat,
        lng: payload.lng,
        speed: payload.speed,
        heading: payload.heading,
        source: payload.source ?? 'PHONE_GPS',
      },
    });
    await writeVehicleLocationCache(
      this.redis,
      payload,
      payload.source ?? 'PHONE_GPS',
    );
  }
}

@Injectable()
export class DeviceGpsSource {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async resolveVehicleByImei(imei: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { deviceImei: imei },
      include: { driver: true },
    });
    if (!vehicle || vehicle.status === VehicleStatus.INACTIVE) {
      return null;
    }
    return vehicle;
  }

  async ingest(payload: LocationPayload) {
    const source = payload.source ?? 'DEVICE_GPS';

    if (payload.tripId) {
      await this.prisma.locationLog.create({
        data: {
          tripId: payload.tripId,
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed,
          heading: payload.heading,
          source,
        },
      });
    }

    await writeVehicleLocationCache(this.redis, payload, source);
  }

  async buildPayloadFromImei(
    imei: string,
    coords: Pick<LocationPayload, 'lat' | 'lng' | 'speed' | 'heading'>,
  ): Promise<LocationPayload | null> {
    const vehicle = await this.resolveVehicleByImei(imei);
    if (!vehicle) return null;

    const activeTrip = await this.prisma.trip.findFirst({
      where: { vehicleId: vehicle.id, status: TripStatus.STARTED },
      select: { id: true },
    });

    return {
      ...coords,
      vehicleId: vehicle.id,
      madrasaId: vehicle.madrasaId,
      driverId: vehicle.driverId ?? undefined,
      tripId: activeTrip?.id,
      source: 'DEVICE_GPS',
    };
  }
}
