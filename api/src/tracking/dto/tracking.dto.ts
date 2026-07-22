import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class LocationDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lng: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heading?: number;
}

export class EtaQueryDto {
  @ApiPropertyOptional({ description: 'Student ID for pickup ETA' })
  @IsOptional()
  studentId?: string;
}
