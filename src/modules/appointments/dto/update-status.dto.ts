import { IsEnum } from 'class-validator';
import { FinishStatus } from 'src/utils/enums/FinishStatus';

export class UpdateStatusDto {
  @IsEnum(FinishStatus)
  status: FinishStatus;
}
