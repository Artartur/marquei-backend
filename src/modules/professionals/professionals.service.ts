import { Injectable } from '@nestjs/common';
import { ProfessionalsRepository } from './professionals.repository';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { LinkServiceDto } from './dto/link-service.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private professionalsService: ProfessionalsRepository) {}

  public async addSchedule(professionalId: string, dto: SetScheduleDto) {
    return this.professionalsService.addSchedule(professionalId, dto);
  }

  public async getSchedule(professionalId: string) {
    return this.professionalsService.getSchedule(professionalId);
  }

  public async replaceSchedule(professionalId: string, dto: SetScheduleDto) {
    return this.professionalsService.replaceSchedule(professionalId, dto);
  }

  public async getProfessionalServices(professionalId: string) {
    return this.professionalsService.getProfessionalServices(professionalId);
  }

  public async linkService(professionalId: string, dto: LinkServiceDto) {
    return this.professionalsService.linkService(professionalId, dto);
  }

  public async unlinkService(professionalId: string, serviceId: string) {
    return this.professionalsService.unlinkService(professionalId, serviceId);
  }
}
