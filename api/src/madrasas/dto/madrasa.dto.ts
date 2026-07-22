import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMadrasaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateMadrasaDto extends PartialType(CreateMadrasaDto) {}
