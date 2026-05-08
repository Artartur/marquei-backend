import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AppointmentCancelledEvent,
  AppointmentCreatedEvent,
  AppointmentReminderEvent,
  AppointmentRescheduledEvent,
} from './events/appointment.event';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  private format(scheduledAt: string) {
    return new Date(scheduledAt).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  private notify(
    channel: 'EMAIL' | 'PUSH',
    recipient: string,
    message: string,
  ) {
    this.logger.log(`[${channel}] → ${recipient} | ${message}`);
  }

  @OnEvent('appointment.cancelled', { async: true })
  public handleCancelled({ appointment }: AppointmentCancelledEvent) {
    const service = appointment.service.name;
    const clientEmail = appointment.client.email;
    const clientName = appointment.client.name;
    const when = this.format(appointment.scheduledAt);

    this.notify(
      'EMAIL',
      clientEmail,
      `${clientName}, seu agendamento de "${service}" em ${when} foi cancelado.`,
    );

    this.notify(
      'PUSH',
      `professional:${appointment.professionalId}`,
      `Agendamento cancelado: ${clientName} — "${service}" em ${when}.`,
    );
  }

  @OnEvent('appointment.created', { async: true })
  public handleCreated({ appointment }: AppointmentCreatedEvent) {
    const when = this.format(appointment.scheduledAt);
    const service = appointment.service.name;
    const professional = appointment.professional?.user?.name ?? 'profissional';
    const clientEmail = appointment.client.email;
    const clientName = appointment.client.name;

    this.notify(
      'EMAIL',
      clientEmail,
      `Olá ${clientName}, seu agendamento de "${service}" com ${professional} foi confirmado para ${when}.`,
    );

    this.notify(
      'PUSH',
      `professional:${appointment.professionalId}`,
      `Novo agendamento: ${clientName} — "${service}" em ${when}.`,
    );
  }

  @OnEvent('appointment.reminder', { async: true })
  public handleReminder({ appointment }: AppointmentReminderEvent) {
    const when = this.format(appointment.scheduledAt);
    const service = appointment.service.name;
    const clientEmail = appointment.client.email;
    const clientName = appointment.client.name;

    this.notify(
      'EMAIL',
      clientEmail,
      `Lembrete: ${clientName}, você tem "${service}" amanhã às ${when}.`,
    );

    this.notify(
      'PUSH',
      `professional:${appointment.professionalId}`,
      `Lembrete: atendimento "${service}" com ${clientName} amanhã às ${when}.`,
    );
  }

  @OnEvent('appointment.rescheduled', { async: true })
  public handleRescheduled({ appointment }: AppointmentRescheduledEvent) {
    const when = this.format(appointment.scheduledAt);
    const service = appointment.service.name;
    const clientEmail = appointment.client.email;
    const clientName = appointment.client.name;

    this.notify(
      'EMAIL',
      clientEmail,
      `${clientName}, seu agendamento de "${service}" foi remarcado para ${when}.`,
    );

    this.notify(
      'PUSH',
      `professional:${appointment.professionalId}`,
      `Agendamento remarcado: ${clientName} — "${service}" para ${when}.`,
    );
  }
}
