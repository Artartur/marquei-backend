export interface AppointmentsFilter {
  filters: Filters;
}

interface Filters {
  clientId?: string;
  professionalId?: string;
  serviceId?: string;
  status?: string;
  from?: string;
  to?: string;
}
