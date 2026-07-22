import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class InitiatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '2026-07' })
  @IsString()
  @IsNotEmpty()
  month: string;
}

export class ExecutePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

export class PaymentQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  month?: string;
}

export class BkashCallbackDto {
  @ApiPropertyOptional()
  @IsOptional()
  paymentID?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  trxID?: string;
}
