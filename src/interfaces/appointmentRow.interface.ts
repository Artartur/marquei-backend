import { Appointments, AppointmentProfessionalUser } from './appointments.interface';
import { Service } from './service.interface';

export interface AppointmentRowService extends Omit<Service, 'active'> {
  id: string;
}

export interface AppointmentRow extends Pick<Appointments, 'id' | 'status'> {
  service: AppointmentRowService | null;
  professional: { id: string; user: AppointmentProfessionalUser | null } | null;
}
