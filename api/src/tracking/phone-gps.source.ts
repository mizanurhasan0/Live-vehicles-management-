import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LocationPayload } from './tracking-source.interface';

@Injectable()
export class PhoneGpsSource {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async ingest(payload: LocationPayload) {
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
    await this.redis.client.setex(
      this.redis.vehicleLocationKey(payload.vehicleId),
      300,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    );
  }
}

@Injectable()
export class DeviceGpsSource {
  async ingest(_payload: LocationPayload) {
    throw new Error('GPS device support coming in Phase 2');
  }
}
