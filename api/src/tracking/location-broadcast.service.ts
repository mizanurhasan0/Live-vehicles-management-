import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { LocationPayload } from './tracking-source.interface';

@Injectable()
export class LocationBroadcastService {
  private server: Server | null = null;

  constructor(private prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server;
  }

  async broadcastLocation(payload: LocationPayload): Promise<void> {
    if (!this.server) return;

    const update = { ...payload, updatedAt: new Date().toISOString() };

    this.server
      .to(`madrasa:${payload.madrasaId}`)
      .emit('vehicle:location', update);

    if (payload.driverId) {
      this.server
        .to(`driver:${payload.driverId}`)
        .emit('vehicle:location', update);
    }

    const students = await this.prisma.student.findMany({
      where: { vehicleId: payload.vehicleId },
      select: { guardianId: true },
    });
    for (const s of students) {
      this.server
        .to(`guardian:${s.guardianId}`)
        .emit('vehicle:location', update);
    }
  }
}
