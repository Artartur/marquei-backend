import { DayOfWeek } from 'src/utils/enums/DayOfWeek';

export interface WorkSchedules {
  dayOfWeek: DayOfWeek;
  endTime: string;
  startTime: string;
}
