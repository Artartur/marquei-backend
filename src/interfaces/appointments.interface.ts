import { AppointmentStatus } from 'src/utils/enums/AppointmentStatus';
import { Service } from './service.interface';

export interface AppointmentProfessional {
  id: string;
  userId: string;
}

export interface AppointmentClient {
  id: string;
  name: string;
  email: string;
}

export interface Appointments {
  id: string;
  cancelationNote: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  status: AppointmentStatus;
  scheduledAt: string;
  endsAt: string;
  cancelledAt: string;
  cancelledBy: string;
  createdAt: string;
  updatedAt: string;
  service: Omit<Service, 'active'>;
  professional: AppointmentProfessional;
  client: AppointmentClient;
}
