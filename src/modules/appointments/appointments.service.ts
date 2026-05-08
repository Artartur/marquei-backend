import { Injectable } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserRole } from 'src/utils/enums/UserRole';
import { AppointmentsFilter } from 'src/interfaces/appointmentsFilter.interface';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  public async cancel(
    id: string,
    userId: string,
    role: UserRole,
    dto: CancelAppointmentDto,
  ) {
    return await this.appointmentsRepository.cancel(id, userId, role, dto);
  }

  public async create(clientId: string, dto: CreateAppointmentDto) {
    return await this.appointmentsRepository.create(clientId, dto);
  }

  public async findById(id: string) {
    return await this.appointmentsRepository.findById(id);
  }

  public async getAvailableSlots(
    date: string,
    professionalId: string,
    serviceId: string,
  ) {
    return await this.appointmentsRepository.getAvailableSlots(
      date,
      professionalId,
      serviceId,
    );
  }

  public async getDailyAgenda(role: UserRole, userId: string, date: string) {
    return await this.appointmentsRepository.getDailyAgenda(role, userId, date);
  }

  public async getHistory(filter: AppointmentsFilter) {
    return this.appointmentsRepository.getHistory(filter);
  }

  public async reschedule(
    id: string,
    clientId: string,
    dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsRepository.reschedule(id, clientId, dto);
  }

  public async updateStatus(id: string, userId: string, dto: UpdateStatusDto) {
    return this.appointmentsRepository.updateStatus(id, userId, dto);
  }
}
