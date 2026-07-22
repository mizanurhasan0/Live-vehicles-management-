import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneGpsSource } from './phone-gps.source';

@WebSocketGateway({ namespace: '/tracking', cors: true })
export class TrackingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    private phoneGps: PhoneGpsSource,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers.authorization?.replace('Bearer ', '');
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get('app.jwtSecret'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { driver: true, guardian: true },
      });
      if (!user?.isActive) return client.disconnect();

      client.data.user = {
        sub: user.id,
        role: user.role,
        madrasaId: user.madrasaId,
        driverId: user.driver?.id,
        guardianId: user.guardian?.id,
      };

      if (user.role === 'ADMIN') {
        client.join(`madrasa:${user.madrasaId}`);
      } else if (user.role === 'GUARDIAN' && user.guardian) {
        client.join(`guardian:${user.guardian.id}`);
      } else if (user.role === 'DRIVER' && user.driver) {
        client.join(`driver:${user.driver.id}`);
      }
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('location:update')
  async onLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { lat: number; lng: number; speed?: number; heading?: number },
  ) {
    const user = client.data.user;
    if (!user?.driverId) return { error: 'Unauthorized' };

    const trip = await this.prisma.trip.findFirst({
      where: { driverId: user.driverId, status: 'STARTED' },
    });
    if (!trip) return { error: 'No active trip' };

    const payload = {
      ...body,
      vehicleId: trip.vehicleId,
      tripId: trip.id,
      madrasaId: user.madrasaId,
      driverId: user.driverId,
    };
    await this.phoneGps.ingest(payload);

    const update = { ...payload, updatedAt: new Date().toISOString() };
    this.server
      .to(`madrasa:${user.madrasaId}`)
      .emit('vehicle:location', update);

    this.server
      .to(`driver:${user.driverId}`)
      .emit('vehicle:location', update);

    const students = await this.prisma.student.findMany({
      where: { vehicleId: trip.vehicleId },
      select: { guardianId: true },
    });
    for (const s of students) {
      this.server
        .to(`guardian:${s.guardianId}`)
        .emit('vehicle:location', update);
    }
    return { ok: true };
  }
}
