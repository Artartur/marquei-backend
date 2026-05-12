import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  public async getDashboard(from: string, to: string) {
    return this.dashboardRepository.getDashboard(from, to);
  }
}
