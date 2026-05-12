import { ProfessionalOccupation } from './professionalOccupation.interface';
import { TopService } from './topService.interface';

export interface DashboardData {
  estimatedRevenue: number;
  noShowRate: number;
  occupationByProfessional: ProfessionalOccupation[];
  period: { from: string; to: string };
  topServices: TopService[];
  totalAppointments: number;
}
