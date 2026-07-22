import { Module } from '@nestjs/common';
import { MadrasasController } from './madrasas.controller';
import { MadrasasService } from './madrasas.service';

@Module({
  controllers: [MadrasasController],
  providers: [MadrasasService],
})
export class MadrasasModule {}
