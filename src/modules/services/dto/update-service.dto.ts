import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
