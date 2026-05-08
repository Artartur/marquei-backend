import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { WorkSchedules } from 'src/interfaces/workSchedules.interface';
import { LinkServiceDto } from './dto/link-service.dto';
import { ProfessionalService } from 'src/interfaces/professionalsServices.interface';
import { User } from 'src/interfaces/user.interface';
import { Professional } from 'src/interfaces/professional.interface';

@Injectable()
export class ProfessionalsRepository {
  constructor(private db: DatabaseService) {}

  private async findProfessionalById(id: string) {
    const { data, error } = await this.db
      .getClient()
      .from('professionals')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Profissional ${id} não encontrado`);
    }

    return data;
  }

  public async findProfessionals(): Promise<User[]> {
    const { data, error } = await this.db
      .getClient()
      .from('professionals')
      .select('id, user:users(id, cpf, email, name, phone, role)');

    if (error) throw new InternalServerErrorException(error.message);

    return (data as unknown as Professional[]).map((row) => ({
      ...row.user,
      professionalId: row.id,
    }));
  }

  public async addSchedule(
    professionalId: string,
    dto: SetScheduleDto,
  ): Promise<WorkSchedules[]> {
    await this.findProfessionalById(professionalId);

    const rows = dto.schedules.map((s) => ({
      professionalId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const { data, error } = await this.db
      .getClient()
      .from('workschedules')
      .upsert(rows, { onConflict: 'professionalId,dayOfWeek' })
      .select();

    if (error) throw new BadRequestException(error.message);

    return (data as WorkSchedules[]) ?? [];
  }

  public async getSchedule(professionalId: string): Promise<WorkSchedules[]> {
    await this.findProfessionalById(professionalId);

    const { data, error } = await this.db
      .getClient()
      .from('workschedules')
      .select('id, dayOfWeek, startTime, endTime')
      .eq('professionalId', professionalId)
      .order('dayOfWeek');

    if (error) throw new BadRequestException(error.message);

    return data ?? [];
  }

  public async replaceSchedule(
    professionalId: string,
    dto: SetScheduleDto,
  ): Promise<WorkSchedules[]> {
    await this.findProfessionalById(professionalId);

    const { error: deleteError } = await this.db
      .getClient()
      .from('workschedules')
      .delete()
      .eq('professionalId', professionalId);

    if (deleteError) throw new BadRequestException(deleteError.message);

    const rows = dto.schedules.map((s) => ({
      professionalId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const { data, error } = await this.db
      .getClient()
      .from('workschedules')
      .insert(rows)
      .select();

    if (error) throw new BadRequestException(error.message);

    return data as WorkSchedules[];
  }

  public async getProfessionalServices(professionalId: string) {
    await this.findProfessionalById(professionalId);

    const { data, error } = await this.db
      .getClient()
      .from('professionalsServices')
      .select(
        `
          serviceId,
          service:services (
            id,
            name,
            durationMinutes,
            price,
            active
          )
        `,
      )
      .eq('professionalId', professionalId);

    if (error) throw new BadRequestException(error.message);

    return data.map((row) => row.service);
  }

  public async linkService(
    professionalId: string,
    dto: LinkServiceDto,
  ): Promise<ProfessionalService> {
    await this.findProfessionalById(professionalId);

    const { data: service, error: serviceError } = await this.db
      .getClient()
      .from('services')
      .select('id, active')
      .eq('id', dto.serviceId)
      .maybeSingle();

    if (serviceError || !service) {
      throw new NotFoundException(`Serviço ${dto.serviceId} não encontrado`);
    }

    if (!service.active) {
      throw new BadRequestException(
        'Não é possível vincular um serviço inativo',
      );
    }

    const response = await this.db
      .getClient()
      .from('professionalsServices')
      .insert({ professionalId, serviceId: dto.serviceId })
      .select()
      .maybeSingle();

    if (response.error) {
      if (response.error.code === '23505') {
        throw new BadRequestException(
          'Serviço já vinculado a este profissional',
        );
      }
      throw new BadRequestException(response.error.message);
    }

    return response.data as ProfessionalService;
  }

  public async unlinkService(professionalId: string, serviceId: string) {
    await this.findProfessionalById(professionalId);

    const { data, error } = await this.db
      .getClient()
      .from('professionalsServices')
      .delete()
      .eq('professionalId', professionalId)
      .eq('serviceId', serviceId)
      .select()
      .maybeSingle<ProfessionalService>();

    if (error || !data) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    return { message: 'Serviço desvinculado com sucesso' };
  }
}
