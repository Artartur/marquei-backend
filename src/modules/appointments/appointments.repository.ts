import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Appointments } from 'src/interfaces/appointments.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UserRole } from 'src/utils/enums/UserRole';
import { DayOfWeek } from 'src/utils/enums/DayOfWeek';
import { AppointmentStatus } from 'generated/prisma/enums';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Service } from 'src/interfaces/service.interface';
import { AppointmentsFilter } from 'src/interfaces/appointmentsFilter.interface';

@Injectable()
export class AppointmentsRepository {
  private MIN_CANCEL_HOURS = 2;

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.getClient();
  }

  private assertMinimumNotice(scheduledAt: string) {
    const diff =
      (new Date(scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);

    if (diff < this.MIN_CANCEL_HOURS) {
      throw new BadRequestException(
        `Ação permitida somente com ${this.MIN_CANCEL_HOURS}h de antecedência`,
      );
    }
  }

  private async findAppointmentOrFail(id: string): Promise<Appointments> {
    const result = await this.db
      .from('appointments')
      .select(
        `*,
            service:services ( id, name, durationMinutes, price ),
            professional:professionals ( id, userId, user:users ( id, name ) ),
            client:users!appointments_clientId_fkey ( id, name, email )`,
      )
      .eq('id', id)
      .maybeSingle();

    const error = result.error;
    const data = result.data as Appointments | null;

    if (error || !data) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    return data;
  }

  public async getAvailableSlots(
    date: string,
    professionalId: string,
    serviceId: string,
  ) {
    const { data: service, error: serviceError } = await this.db
      .from('services')
      .select('durationMinutes')
      .eq('id', serviceId)
      .eq('active', true)
      .single();

    if (serviceError || !service) {
      throw new NotFoundException('Serviço não encontrado ou inativo');
    }

    const days: DayOfWeek[] = [
      DayOfWeek.DOMINGO,
      DayOfWeek.SEGUNDA,
      DayOfWeek.TERCA,
      DayOfWeek.QUARTA,
      DayOfWeek.QUINTA,
      DayOfWeek.SEXTA,
      DayOfWeek.SABADO,
    ];

    const dayOfWeek = days[new Date(date + 'T12:00:00').getDay()];

    const { data: schedule, error: scheduleError } = await this.db
      .from('workschedules')
      .select('startTime, endTime')
      .eq('professionalId', professionalId)
      .eq('dayOfWeek', dayOfWeek)
      .single();

    if (scheduleError || !schedule) {
      return [];
    }

    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const { data: booked, error: bookedError } = await this.db
      .from('appointments')
      .select('scheduledAt, endsAt')
      .eq('professionalId', professionalId)
      .eq('status', 'SCHEDULED')
      .gte('scheduledAt', dayStart)
      .lte('scheduledAt', dayEnd);

    if (bookedError) throw new BadRequestException(bookedError.message);

    const slots: string[] = [];
    const duration = service.durationMinutes * 60 * 1000;
    const start = new Date(`${date}T${schedule.startTime}:00`);
    const end = new Date(`${date}T${schedule.endTime}:00`);

    let cursor = new Date(start);

    while (cursor.getTime() + duration <= end.getTime()) {
      const slotEnd = new Date(cursor.getTime() + duration);

      const hasConflict = (booked ?? []).some((appt) => {
        const aStart = new Date(appt.scheduledAt as string).getTime();
        const aEnd = new Date(appt.endsAt as string).getTime();
        return cursor.getTime() < aEnd && slotEnd.getTime() > aStart;
      });

      if (!hasConflict) {
        slots.push(cursor.toISOString());
      }

      cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  public async create(clientId: string, dto: CreateAppointmentDto) {
    const { data, error: serviceError } = await this.db
      .from('services')
      .select('durationMinutes')
      .eq('id', dto.serviceId)
      .eq('active', true)
      .single();

    if (serviceError || !data) {
      throw new NotFoundException('Serviço não encontrado ou inativo');
    }

    const service = data as Omit<Service, 'active' | 'name' | 'price'>;

    const scheduledAt = new Date(dto.scheduledAt);
    const endsAt = new Date(
      scheduledAt.getTime() + service.durationMinutes * 60 * 1000,
    );

    if (scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Não é possível agendar em horários passados',
      );
    }

    const rpcResult = await this.db.rpc('book_appointment', {
      p_client_id: clientId,
      p_professional_id: dto.professionalId,
      p_service_id: dto.serviceId,
      p_scheduled_at: scheduledAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
    });

    if (rpcResult.error) {
      if (rpcResult.error.message.includes('SLOT_LOCKED')) {
        throw new BadRequestException(
          'Horário sendo reservado simultaneamente, tente novamente',
        );
      }
      if (rpcResult.error.message.includes('SLOT_UNAVAILABLE')) {
        throw new BadRequestException('Horário indisponível');
      }
      throw new BadRequestException(rpcResult.error.message);
    }

    const created = rpcResult.data as { id: string };

    return this.findAppointmentOrFail(created.id);
  }

  public async getDailyAgenda(role: UserRole, userId: string, date: string) {
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    let query = this.db
      .from('appointments')
      .select(
        `
          id, status, scheduledAt, endsAt,
          client:users!appointments_clientId_fkey ( id, name, phone ),
          professional:professionals (
            id,
            user:users ( id, name )
          ),
          service:services ( id, name, durationMinutes, price )
        `,
      )
      .gte('scheduledAt', dayStart)
      .lte('scheduledAt', dayEnd)
      .order('scheduledAt');

    if (role === UserRole.PROFESSIONAL) {
      const { data: prof } = await this.db
        .from('professionals')
        .select('id')
        .eq('userId', userId)
        .single();

      if (!prof) return [];
      query = query.eq('professionalId', prof.id);
    }

    if (role === UserRole.CLIENT) {
      query = query.eq('clientId', userId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    return data;
  }

  public async getHistory(filter: AppointmentsFilter) {
    const filters = filter.filters;

    let query = this.db
      .from('appointments')
      .select(
        `
          id, status, scheduledAt, endsAt, cancelledAt, cancellationNote,
          client:users!appointments_clientId_fkey ( id, name ),
          professional:professionals (
            id,
            user:users ( id, name )
          ),
          service:services ( id, name, price )
        `,
      )
      .order('scheduledAt', { ascending: false });

    if (filters.clientId) query = query.eq('clientId', filters.clientId);
    if (filters.professionalId)
      query = query.eq('professionalId', filters.professionalId);
    if (filters.serviceId) query = query.eq('serviceId', filters.serviceId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.from) query = query.gte('scheduledAt', filters.from);
    if (filters.to) query = query.lte('scheduledAt', filters.to);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    return data;
  }

  public async findById(id: string) {
    return this.findAppointmentOrFail(id);
  }

  public async reschedule(
    id: string,
    clientId: string,
    dto: RescheduleAppointmentDto,
  ) {
    const appointment = await this.findAppointmentOrFail(id);

    if (appointment.clientId !== clientId) {
      throw new ForbiddenException('Você não pode remarcar este agendamento');
    }

    if (
      (appointment.status as AppointmentStatus) !== AppointmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Apenas agendamentos ativos podem ser remarcados',
      );
    }

    this.assertMinimumNotice(appointment.scheduledAt);

    const duration = appointment.service.durationMinutes * 60 * 1000;
    const newScheduledAt = new Date(dto.scheduledAt);
    const newEndsAt = new Date(newScheduledAt.getTime() + duration);

    if (newScheduledAt <= new Date()) {
      throw new BadRequestException(
        'Não é possível remarcar para horários passados',
      );
    }

    const { error: cancelError } = await this.db
      .from('appointments')
      .update({
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        cancelledBy: clientId,
        cancellationNote: 'Remarcado pelo cliente',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (cancelError) throw new BadRequestException(cancelError.message);

    const response = await this.db.rpc('book_appointment', {
      p_client_id: clientId,
      p_professional_id: appointment.professionalId,
      p_service_id: appointment.serviceId,
      p_scheduled_at: newScheduledAt.toISOString(),
      p_ends_at: newEndsAt.toISOString(),
    });

    if (response.error) {
      await this.db
        .from('appointments')
        .update({
          status: 'SCHEDULED',
          cancelledAt: null,
          cancelledBy: null,
          cancellationNote: null,
        })
        .eq('id', id);

      if (response.error.message.includes('SLOT_UNAVAILABLE')) {
        throw new BadRequestException('Novo horário indisponível');
      }
      throw new BadRequestException(response.error.message);
    }

    const rescheduled = response.data as { id: string };

    return this.findAppointmentOrFail(rescheduled.id);
  }

  public async cancel(
    id: string,
    userId: string,
    role: UserRole,
    dto: CancelAppointmentDto,
  ) {
    const appointment = await this.findAppointmentOrFail(id);

    if (role === UserRole.CLIENT && appointment.clientId !== userId) {
      throw new ForbiddenException('Você não pode cancelar este agendamento');
    }

    if (
      (appointment.status as AppointmentStatus) !== AppointmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Apenas agendamentos ativos podem ser cancelados',
      );
    }

    if (role === UserRole.CLIENT) {
      this.assertMinimumNotice(appointment.scheduledAt);
    }

    const response = await this.db
      .from('appointments')
      .update({
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date().toISOString(),
        cancelledBy: userId,
        cancellationNote: dto.cancellationNote ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (response.error) throw new BadRequestException(response.error.message);

    return this.findAppointmentOrFail(id);
  }

  public async updateStatus(
    id: string,
    userId: string,
    dto: UpdateStatusDto,
    role: UserRole,
  ) {
    const appointment = await this.findAppointmentOrFail(id);

    if (
      role !== UserRole.MANAGER &&
      appointment.professional.userId !== userId
    ) {
      throw new ForbiddenException('Você não pode atualizar este agendamento');
    }

    if (
      (appointment.status as AppointmentStatus) !== AppointmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Apenas agendamentos ativos podem ser atualizados',
      );
    }

    const response = await this.db
      .from('appointments')
      .update({
        status: dto.status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (response.error) throw new BadRequestException(response.error.message);

    return response.data as Appointments;
  }
}
