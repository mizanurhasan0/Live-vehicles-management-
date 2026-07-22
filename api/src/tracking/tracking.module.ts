import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DeviceGpsSource, PhoneGpsSource } from './phone-gps.source';
import { OsrmService } from './osrm.service';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [TrackingController],
  providers: [
    TrackingService,
    OsrmService,
    PhoneGpsSource,
    DeviceGpsSource,
    TrackingGateway,
  ],
  exports: [TrackingService, PhoneGpsSource],
})
export class TrackingModule {}
