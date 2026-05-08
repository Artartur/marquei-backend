import { Injectable } from '@nestjs/common';
import { ProfessionalsRepository } from './professionals.repository';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { LinkServiceDto } from './dto/link-service.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private professionalsRepository: ProfessionalsRepository) {}

  public async addSchedule(professionalId: string, dto: SetScheduleDto) {
    return this.professionalsRepository.addSchedule(professionalId, dto);
  }

  public async findProfessionals() {
    return this.professionalsRepository.findProfessionals();
  }

  public async getSchedule(professionalId: string) {
    return this.professionalsRepository.getSchedule(professionalId);
  }

  public async replaceSchedule(professionalId: string, dto: SetScheduleDto) {
    return this.professionalsRepository.replaceSchedule(professionalId, dto);
  }

  public async getProfessionalServices(professionalId: string) {
    return this.professionalsRepository.getProfessionalServices(professionalId);
  }

  public async linkService(professionalId: string, dto: LinkServiceDto) {
    return this.professionalsRepository.linkService(professionalId, dto);
  }

  public async unlinkService(professionalId: string, serviceId: string) {
    return this.professionalsRepository.unlinkService(
      professionalId,
      serviceId,
    );
  }
}
