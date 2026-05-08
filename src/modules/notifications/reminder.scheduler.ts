import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../database/database.service';
import { Appointments } from 'src/interfaces/appointments.interface';
import { AppointmentReminderEvent } from './events/appointment.event';

@Injectable()
export class ReminderScheduler {
  private logger = new Logger(ReminderScheduler.name);

  constructor(
    private db: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async sendReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data, error } = await this.db
      .getClient()
      .from('appointments')
      .select(
        `
        *,
        service:services ( id, name, durationMinutes, price ),
        professional:professionals ( id, userId,
          user:users ( id, name )
        ),
        client:users!appointments_clientId_fkey ( id, name, email )
      `,
      )
      .eq('status', 'SCHEDULED')
      .eq('reminderSent', false)
      .gte('scheduledAt', windowStart.toISOString())
      .lte('scheduledAt', windowEnd.toISOString());

    if (error) {
      this.logger.error('Erro ao buscar lembretes', error.message);
      return;
    }

    for (const appointment of (data ?? []) as Appointments[]) {
      await this.db
        .getClient()
        .from('appointments')
        .update({ reminderSent: true })
        .eq('id', appointment.id);

      this.eventEmitter.emit(
        'appointment.reminder',
        new AppointmentReminderEvent(appointment),
      );
    }

    this.logger.log(`Lembretes disparados: ${data?.length ?? 0}`);
  }
}
