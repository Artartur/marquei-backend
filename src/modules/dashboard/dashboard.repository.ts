import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProfessionalOccupation } from 'src/interfaces/professionalOccupation.interface';
import { TopService } from 'src/interfaces/topService.interface';
import { DashboardData } from 'src/interfaces/dashboard.interface';
import { AppointmentRow } from 'src/interfaces/appointmentRow.interface';
import { WorkScheduleRow } from 'src/interfaces/workScheduleRow.interface';
import { DayOfWeek } from 'src/utils/enums/DayOfWeek';
import { AppointmentStatus } from 'src/utils/enums/AppointmentStatus';

const DAY_NAMES: DayOfWeek[] = [
  DayOfWeek.DOMINGO,
  DayOfWeek.SEGUNDA,
  DayOfWeek.TERCA,
  DayOfWeek.QUARTA,
  DayOfWeek.QUINTA,
  DayOfWeek.SEXTA,
  DayOfWeek.SABADO,
];

@Injectable()
export class DashboardRepository {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.getClient();
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private computeAvailableMinutes(
    schedules: WorkScheduleRow[],
    from: Date,
    to: Date,
  ): Map<string, number> {
    const result = new Map<string, number>();

    const scheduleMap = new Map<string, Map<string, WorkScheduleRow>>();
    for (const s of schedules) {
      if (!scheduleMap.has(s.professionalId)) {
        scheduleMap.set(s.professionalId, new Map());
      }
      scheduleMap.get(s.professionalId)!.set(s.dayOfWeek, s);
    }

    const cursor = new Date(from);
    while (cursor <= to) {
      const dayName = DAY_NAMES[cursor.getDay()];
      for (const [profId, dayMap] of scheduleMap) {
        const sched = dayMap.get(dayName);
        if (sched) {
          const minutes =
            this.timeToMinutes(sched.endTime) -
            this.timeToMinutes(sched.startTime);
          result.set(profId, (result.get(profId) ?? 0) + minutes);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  public async getDashboard(from: string, to: string): Promise<DashboardData> {
    const fromDate = new Date(from + 'T00:00:00.000Z');
    const toDate = new Date(to + 'T23:59:59.999Z');

    const { data: appointmentsRaw, error: apptError } = await this.db
      .from('appointments')
      .select(
        `id, status,
        service:services ( id, name, durationMinutes, price ),
        professional:professionals ( id, user:users ( id, name ) )`,
      )
      .gte('scheduledAt', fromDate.toISOString())
      .lte('scheduledAt', toDate.toISOString());

    if (apptError) throw new Error(apptError.message);

    const { data: schedulesRaw, error: schedError } = await this.db
      .from('workschedules')
      .select(
        `professionalId, dayOfWeek, startTime, endTime,
        professional:professionals ( id, user:users ( id, name ) )`,
      );

    if (schedError) throw new Error(schedError.message);

    const appointments = (appointmentsRaw ?? []) as unknown as AppointmentRow[];
    const schedules = (schedulesRaw ?? []) as unknown as WorkScheduleRow[];

    const availableMap = this.computeAvailableMinutes(
      schedules,
      fromDate,
      toDate,
    );

    const profMap = new Map<string, ProfessionalOccupation>();

    for (const s of schedules) {
      const profId = s.professionalId;
      if (!profMap.has(profId)) {
        profMap.set(profId, {
          professionalId: profId,
          professionalName: s.professional?.user?.name ?? 'Unknown',
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          bookedMinutes: 0,
          availableMinutes: availableMap.get(profId) ?? 0,
          occupationRate: 0,
        });
      }
    }

    let totalNoShow = 0;
    let estimatedRevenue = 0;
    const serviceMap = new Map<string, TopService>();

    for (const appt of appointments) {
      const profId = appt.professional?.id ?? '';
      const service = appt.service;

      if (!profMap.has(profId)) {
        profMap.set(profId, {
          professionalId: profId,
          professionalName: appt.professional?.user?.name ?? 'Unknown',
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          bookedMinutes: 0,
          availableMinutes: availableMap.get(profId) ?? 0,
          occupationRate: 0,
        });
      }

      const prof = profMap.get(profId)!;
      prof.totalAppointments++;

      const duration = service?.durationMinutes ?? 0;
      const price = service?.price ?? 0;

      if (appt.status === ('COMPLETED' as AppointmentStatus)) {
        prof.completedAppointments++;
        prof.bookedMinutes += duration;
        estimatedRevenue += price;
      } else if (appt.status === ('SCHEDULED' as AppointmentStatus)) {
        prof.bookedMinutes += duration;
        estimatedRevenue += price;
      } else if (appt.status === ('CANCELLED' as AppointmentStatus)) {
        prof.cancelledAppointments++;
      } else if (appt.status === ('NO_SHOW' as AppointmentStatus)) {
        prof.noShowAppointments++;
        totalNoShow++;
      }

      if (service) {
        if (!serviceMap.has(service.id)) {
          serviceMap.set(service.id, {
            serviceId: service.id,
            serviceName: service.name,
            appointmentCount: 0,
            estimatedRevenue: 0,
          });
        }
        const svc = serviceMap.get(service.id)!;
        svc.appointmentCount++;
        if (
          appt.status === ('COMPLETED' as AppointmentStatus) ||
          appt.status === ('SCHEDULED' as AppointmentStatus)
        ) {
          svc.estimatedRevenue += price;
        }
      }
    }

    for (const prof of profMap.values()) {
      prof.occupationRate =
        prof.availableMinutes > 0
          ? Math.min(prof.bookedMinutes / prof.availableMinutes, 1)
          : 0;
    }

    const totalAppointments = appointments.length;
    const noShowRate =
      totalAppointments > 0 ? totalNoShow / totalAppointments : 0;

    const topServices = [...serviceMap.values()]
      .sort((a, b) => b.appointmentCount - a.appointmentCount)
      .slice(0, 10);

    return {
      period: { from, to },
      totalAppointments,
      noShowRate,
      estimatedRevenue,
      occupationByProfessional: [...profMap.values()].sort(
        (a, b) => b.totalAppointments - a.totalAppointments,
      ),
      topServices,
    };
  }
}
