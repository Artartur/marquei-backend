import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FinishStatus } from 'src/utils/enums/FinishStatus';

export class UpdateStatusDto {
  @ApiProperty({ enum: FinishStatus, example: FinishStatus.COMPLETED })
  @IsEnum(FinishStatus)
  status: FinishStatus;
}
