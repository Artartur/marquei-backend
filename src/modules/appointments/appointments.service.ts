import { Injectable } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserRole } from 'src/utils/enums/UserRole';
import { AppointmentsFilter } from 'src/interfaces/appointmentsFilter.interface';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import {
  AppointmentCancelledEvent,
  AppointmentCreatedEvent,
  AppointmentRescheduledEvent,
} from '../notifications/events/appointment.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppointmentsService {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  public async cancel(
    id: string,
    userId: string,
    role: UserRole,
    dto: CancelAppointmentDto,
  ) {
    const appointment = await this.appointmentsRepository.cancel(
      id,
      userId,
      role,
      dto,
    );

    this.eventEmitter.emit(
      'appointment.cancelled',
      new AppointmentCancelledEvent(appointment),
    );

    return appointment;
  }

  public async create(clientId: string, dto: CreateAppointmentDto) {
    const appointment = await this.appointmentsRepository.create(clientId, dto);

    this.eventEmitter.emit(
      'appointment.created',
      new AppointmentCreatedEvent(appointment),
    );

    return appointment;
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
    const appointment = await this.appointmentsRepository.reschedule(
      id,
      clientId,
      dto,
    );

    this.eventEmitter.emit(
      'appointment.rescheduled',
      new AppointmentRescheduledEvent(appointment),
    );

    return appointment;
  }

  public async updateStatus(
    id: string,
    userId: string,
    dto: UpdateStatusDto,
    role: UserRole,
  ) {
    return this.appointmentsRepository.updateStatus(id, userId, dto, role);
  }
}
