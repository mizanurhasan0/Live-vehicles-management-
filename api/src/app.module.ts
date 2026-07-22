import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfig from './config/env.config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { MadrasasModule } from './madrasas/madrasas.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { GuardiansModule } from './guardians/guardians.module';
import { StudentsModule } from './students/students.module';
import { RoutesModule } from './routes/routes.module';
import { TripsModule } from './trips/trips.module';
import { TrackingModule } from './tracking/tracking.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [envConfig] }),
    PrismaModule,
    RedisModule,
    AuthModule,
    MadrasasModule,
    VehiclesModule,
    DriversModule,
    GuardiansModule,
    StudentsModule,
    RoutesModule,
    TripsModule,
    TrackingModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
