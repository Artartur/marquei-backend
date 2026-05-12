import { WorkSchedules } from './workSchedules.interface';
import { AppointmentProfessionalUser } from './appointments.interface';

export interface WorkScheduleRow extends WorkSchedules {
  professionalId: string;
  professional: { id: string; user: AppointmentProfessionalUser | null } | null;
}
