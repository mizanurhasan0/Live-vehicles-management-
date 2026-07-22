import { ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class TripQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TripStatus })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}
