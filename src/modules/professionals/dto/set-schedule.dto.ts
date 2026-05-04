import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from 'src/utils/enums/DayOfWeek';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class SetScheduleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkScheduleItemDto)
  schedules: WorkScheduleItemDto[];
}

export class WorkScheduleItemDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'O hora de inicio deve estar no formato HH:MM',
  })
  startTime: string;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'O horário de termino deve estar no formato HH:MM',
  })
  endTime: string;
}
