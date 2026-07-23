import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createServer, Server, Socket } from 'net';
import { LocationBroadcastService } from './location-broadcast.service';
import { DeviceGpsSource } from './phone-gps.source';

type TcpGpsMessage = {
  imei?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  heading?: number;
};

@Injectable()
export class TcpGpsServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TcpGpsServer.name);
  private server: Server | null = null;

  constructor(
    private config: ConfigService,
    private deviceGps: DeviceGpsSource,
    private locationBroadcast: LocationBroadcastService,
  ) {}

  onModuleInit() {
    const enabled = this.config.get<boolean>('app.gpsTcp.enabled');
    if (!enabled) {
      this.logger.log('GPS TCP server disabled (GPS_TCP_ENABLED=false)');
      return;
    }

    const port = this.config.get<number>('app.gpsTcp.port') ?? 5023;
    const bind = this.config.get<string>('app.gpsTcp.bind') ?? '0.0.0.0';

    this.server = createServer((socket) => this.handleConnection(socket));
    this.server.on('error', (err) => {
      this.logger.error(`GPS TCP server error: ${err.message}`);
    });
    this.server.listen(port, bind, () => {
      this.logger.log(`GPS TCP listening on ${bind}:${port}`);
    });
  }

  async onModuleDestroy() {
    await new Promise<void>((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close(() => resolve());
    });
  }

  private handleConnection(socket: Socket) {
    let buffer = '';

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        void this.handleLine(socket, line.trim());
      }
    });

    socket.on('error', (err) => {
      this.logger.warn(`GPS TCP client error: ${err.message}`);
    });
  }

  private async handleLine(socket: Socket, line: string) {
    if (!line) return;

    let message: TcpGpsMessage;
    try {
      message = JSON.parse(line) as TcpGpsMessage;
    } catch {
      this.reply(socket, 'ERR invalid JSON\n');
      return;
    }

    const { imei, lat, lng, speed, heading } = message;
    if (!imei || typeof lat !== 'number' || typeof lng !== 'number') {
      this.reply(socket, 'ERR imei, lat, lng required\n');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      this.reply(socket, 'ERR lat/lng out of range\n');
      return;
    }

    const payload = await this.deviceGps.buildPayloadFromImei(imei, {
      lat,
      lng,
      speed: typeof speed === 'number' ? speed : undefined,
      heading: typeof heading === 'number' ? heading : undefined,
    });

    if (!payload) {
      this.reply(socket, 'ERR unknown or inactive IMEI\n');
      return;
    }

    try {
      await this.deviceGps.ingest(payload);
      await this.locationBroadcast.broadcastLocation(payload);
      this.reply(socket, 'OK\n');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ingest failed';
      this.logger.warn(`GPS TCP ingest failed for ${imei}: ${msg}`);
      this.reply(socket, `ERR ${msg}\n`);
    }
  }

  private reply(socket: Socket, message: string) {
    if (!socket.destroyed) {
      socket.write(message);
    }
  }
}
