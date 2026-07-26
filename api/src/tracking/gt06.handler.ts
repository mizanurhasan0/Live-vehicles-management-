import { Logger } from '@nestjs/common';
import Gt06 from 'gt06';
import { imeiToString } from './gt06-frame.util';

export type Gt06LocationUpdate = {
  imei: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
};

export class Gt06ConnectionHandler {
  private readonly logger = new Logger(Gt06ConnectionHandler.name);
  private readonly parser = new Gt06();

  handleFrame(frame: Buffer): {
    response?: Buffer;
    locations: Gt06LocationUpdate[];
  } {
    const locations: Gt06LocationUpdate[] = [];
    let response: Buffer | undefined;

    try {
      this.parser.parse(frame);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'parse failed';
      this.logger.warn(`GT06 parse error: ${msg}`);
      return { locations };
    }

    if (this.parser.expectsResponse && this.parser.responseMsg) {
      response = this.parser.responseMsg;
    }

    for (const msg of this.parser.msgBuffer) {
      const event = msg.event?.string;

      if (event === 'login' && msg.imei != null) {
        this.logger.log(`GT06 login IMEI=${imeiToString(msg.imei)}`);
        continue;
      }

      if (
        (event === 'location' || event === 'alarm') &&
        typeof msg.lat === 'number' &&
        typeof msg.lon === 'number'
      ) {
        const imei = imeiToString(msg.imei ?? this.parser.imei);
        if (!imei) {
          this.logger.warn('GT06 location without IMEI — login first');
          continue;
        }

        if (msg.gpsPositioned === false) {
          this.logger.debug(`GT06 location skipped (no GPS fix) IMEI=${imei}`);
          continue;
        }

        locations.push({
          imei,
          lat: msg.lat,
          lng: msg.lon,
          speed: typeof msg.speed === 'number' ? msg.speed : undefined,
          heading: typeof msg.course === 'number' ? msg.course : undefined,
        });
      }
    }

    this.parser.clearMsgBuffer();
    return { response, locations };
  }
}
