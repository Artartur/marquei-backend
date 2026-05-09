import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-05-10T14:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;
}
