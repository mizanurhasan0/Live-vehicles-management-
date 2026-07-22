import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class RouteStopDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lng: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}

export class CreateRouteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [RouteStopDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];
}

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}

export class UpdateRouteStopsDto {
  @ApiProperty({ type: [RouteStopDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];
}
