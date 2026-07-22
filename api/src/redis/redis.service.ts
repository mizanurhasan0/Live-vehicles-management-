import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.get<string>('app.redisUrl')!);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  vehicleLocationKey(id: string) {
    return `vehicle:${id}:location`;
  }

  refreshBlacklistKey(token: string) {
    return `blacklist:refresh:${token}`;
  }
}
