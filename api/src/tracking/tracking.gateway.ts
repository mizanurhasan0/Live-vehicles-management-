import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { LocationBroadcastService } from './location-broadcast.service';
import { PhoneGpsSource } from './phone-gps.source';

@WebSocketGateway({ namespace: '/tracking', cors: true })
export class TrackingGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    private phoneGps: PhoneGpsSource,
    private locationBroadcast: LocationBroadcastService,
  ) {}

  afterInit() {
    this.locationBroadcast.setServer(this.server);
  }

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
    await this.locationBroadcast.broadcastLocation(payload);
    return { ok: true };
  }
}
