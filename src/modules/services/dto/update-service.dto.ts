import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'Haircut' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 50.0 })
  @IsNumber()
  @IsOptional()
  price?: number;
}
