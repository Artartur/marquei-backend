import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelAppointmentDto {
  @ApiPropertyOptional({
    example: 'Client requested cancellation',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cancellationNote?: string;
}
