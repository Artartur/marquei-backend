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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily agenda for the authenticated user' })
  @ApiQuery({ name: 'date', required: false, example: '2026-05-10' })
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
  @ApiOperation({ summary: 'Get appointment history with optional filters' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'professionalId', required: false })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'from', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-12-31' })
  public async getHistory(
    @Query('clientId') clientId?: string,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filters: AppointmentsFilter = {
      filters: { clientId, professionalId, serviceId, status, from, to },
    };
    return this.appointmentsService.getHistory(filters);
  }

  @Get('available')
  @Roles(UserRole.CLIENT, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get available time slots (Client or Manager)' })
  @ApiQuery({ name: 'date', example: '2026-05-10' })
  @ApiQuery({
    name: 'professionalId',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'serviceId',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
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
  @ApiOperation({ summary: 'Find appointment by ID' })
  public async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new appointment (Client only)' })
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.id, dto);
  }

  @Patch(':id/reschedule')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Reschedule an appointment (Client only)' })
  public async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(id, user.id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CLIENT, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel an appointment (Client or Manager)' })
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
  @ApiOperation({
    summary: 'Update appointment status (Professional or Manager)',
  })
  public async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      user.id,
      dto,
      user.role as UserRole,
    );
  }
}
