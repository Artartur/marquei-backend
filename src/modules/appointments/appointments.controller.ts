import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { AppointmentsFilter } from 'src/interfaces/appointmentsFilter.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import type { AuthenticatedUser } from 'src/interfaces/authenticatedUser.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('daily')
  public async getDailyAgenda(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date: string,
  ) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    return this.appointmentsService.getDailyAgenda(
      user.role as UserRole,
      user.id,
      targetDate,
    );
  }

  @Get('history')
  public async getHistory(
    @Query('clientId') clientId?: string,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filters: AppointmentsFilter = {
      filters: {
        clientId,
        professionalId,
        serviceId,
        status,
        from,
        to,
      },
    };
    return this.appointmentsService.getHistory(filters);
  }

  @Get('available')
  @Roles(UserRole.CLIENT, UserRole.MANAGER)
  public async getAvailableSlots(
    @Query('date') date: string,
    @Query('professionalId') professionalId: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.appointmentsService.getAvailableSlots(
      date,
      professionalId,
      serviceId,
    );
  }

  @Get(':id')
  public async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.CLIENT)
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.id, dto);
  }

  @Patch(':id/reschedule')
  @Roles(UserRole.CLIENT)
  public async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(id, user.id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CLIENT, UserRole.MANAGER)
  public async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(
      id,
      user.id,
      user.role as UserRole,
      dto,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.PROFESSIONAL, UserRole.MANAGER)
  public async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, user.id, dto);
  }
}
