import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGuardianDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateGuardianDto extends PartialType(CreateGuardianDto) {}
