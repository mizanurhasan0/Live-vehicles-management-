import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createServer, Server, Socket } from 'net';
import { extractGt06Frames, isGt06Buffer } from './gt06-frame.util';
import { Gt06ConnectionHandler } from './gt06.handler';
import { LocationBroadcastService } from './location-broadcast.service';
import { DeviceGpsSource } from './phone-gps.source';

type TcpGpsMessage = {
  imei?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  heading?: number;
};

type TcpProtocol = 'json' | 'gt06' | 'auto';

type SocketState = {
  protocol?: 'json' | 'gt06';
  jsonBuffer: string;
  gt06Buffer: Buffer;
  gt06: Gt06ConnectionHandler;
};

@Injectable()
export class TcpGpsServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TcpGpsServer.name);
  private server: Server | null = null;
  private readonly socketState = new WeakMap<Socket, SocketState>();

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
    const mode = this.config.get<TcpProtocol>('app.gpsTcp.mode') ?? 'auto';

    this.server = createServer((socket) => this.handleConnection(socket, mode));
    this.server.on('error', (err) => {
      this.logger.error(`GPS TCP server error: ${err.message}`);
    });
    this.server.listen(port, bind, () => {
      this.logger.log(`GPS TCP listening on ${bind}:${port} (mode=${mode})`);
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

  private getState(socket: Socket): SocketState {
    let state = this.socketState.get(socket);
    if (!state) {
      state = {
        jsonBuffer: '',
        gt06Buffer: Buffer.alloc(0),
        gt06: new Gt06ConnectionHandler(),
      };
      this.socketState.set(socket, state);
    }
    return state;
  }

  private handleConnection(socket: Socket, mode: TcpProtocol) {
    const state = this.getState(socket);

    socket.on('data', (chunk) => {
      if (mode === 'gt06' || state.protocol === 'gt06') {
        state.protocol = 'gt06';
        this.handleGt06Chunk(socket, state, chunk);
        return;
      }

      if (mode === 'json') {
        state.protocol = 'json';
        this.handleJsonChunk(socket, state, chunk);
        return;
      }

      if (isGt06Buffer(chunk)) {
        state.protocol = 'gt06';
        this.handleGt06Chunk(socket, state, chunk);
        return;
      }

      state.protocol = 'json';
      this.handleJsonChunk(socket, state, chunk);
    });

    socket.on('error', (err) => {
      this.logger.warn(`GPS TCP client error: ${err.message}`);
    });
  }

  private handleGt06Chunk(socket: Socket, state: SocketState, chunk: Buffer) {
    state.gt06Buffer = Buffer.concat([state.gt06Buffer, chunk]);
    const { frames, rest } = extractGt06Frames(state.gt06Buffer);
    state.gt06Buffer = rest;

    for (const frame of frames) {
      void this.processGt06Frame(socket, state.gt06, frame);
    }
  }

  private handleJsonChunk(socket: Socket, state: SocketState, chunk: Buffer) {
    state.jsonBuffer += chunk.toString('utf8');
    const lines = state.jsonBuffer.split('\n');
    state.jsonBuffer = lines.pop() ?? '';

    for (const line of lines) {
      void this.handleJsonLine(socket, line.trim());
    }
  }

  private async processGt06Frame(
    socket: Socket,
    handler: Gt06ConnectionHandler,
    frame: Buffer,
  ) {
    const { response, locations } = handler.handleFrame(frame);

    if (response && !socket.destroyed) {
      socket.write(response);
    }

    for (const location of locations) {
      await this.ingestLocation(socket, location.imei, {
        lat: location.lat,
        lng: location.lng,
        speed: location.speed,
        heading: location.heading,
      });
    }
  }

  private async handleJsonLine(socket: Socket, line: string) {
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

    const ok = await this.ingestLocation(socket, imei, {
      lat,
      lng,
      speed: typeof speed === 'number' ? speed : undefined,
      heading: typeof heading === 'number' ? heading : undefined,
    });

    this.reply(socket, ok ? 'OK\n' : 'ERR unknown or inactive IMEI\n');
  }

  private async ingestLocation(
    socket: Socket,
    imei: string,
    coords: {
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
    },
  ): Promise<boolean> {
    const payload = await this.deviceGps.buildPayloadFromImei(imei, coords);
    if (!payload) {
      this.logger.warn(`GT06/TCP unknown IMEI: ${imei}`);
      return false;
    }

    try {
      await this.deviceGps.ingest(payload);
      await this.locationBroadcast.broadcastLocation(payload);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ingest failed';
      this.logger.warn(`GPS TCP ingest failed for ${imei}: ${msg}`);
      return false;
    }
  }

  private reply(socket: Socket, message: string) {
    if (!socket.destroyed) {
      socket.write(message);
    }
  }
}
