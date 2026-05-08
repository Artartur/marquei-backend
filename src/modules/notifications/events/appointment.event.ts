import { Appointments } from 'src/interfaces/appointments.interface';

export class AppointmentCancelledEvent {
  constructor(public appointment: Appointments) {}
}

export class AppointmentCreatedEvent {
  constructor(public appointment: Appointments) {}
}

export class AppointmentReminderEvent {
  constructor(public appointment: Appointments) {}
}

export class AppointmentRescheduledEvent {
  constructor(public appointment: Appointments) {}
}
