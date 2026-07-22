import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guardianId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  class?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pickupPoint: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dropPoint: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pickupLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pickupLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dropLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dropLng?: number;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyFee: number;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
