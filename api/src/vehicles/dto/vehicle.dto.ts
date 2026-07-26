import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VehicleStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiPropertyOptional({ example: '869343040629929' })
  @IsOptional()
  @IsString()
  deviceImei?: string;
}

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
