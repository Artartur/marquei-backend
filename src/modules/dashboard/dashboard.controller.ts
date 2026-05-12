import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles(UserRole.MANAGER)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get aggregated dashboard metrics for the period (Manager only). Defaults to current month.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    example: '2026-05-01',
    description:
      'Start date (YYYY-MM-DD). Defaults to first day of current month.',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    example: '2026-05-31',
    description: 'End date (YYYY-MM-DD). Defaults to today.',
  })
  public async getDashboard(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const today = new Date();
    const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const defaultTo = today.toISOString().split('T')[0];

    return this.dashboardService.getDashboard(
      from ?? defaultFrom,
      to ?? defaultTo,
    );
  }
}
