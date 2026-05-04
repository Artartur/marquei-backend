import { Injectable } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private servicesRepository: ServicesRepository) {}

  public async createService(dto: CreateServiceDto) {
    return this.servicesRepository.createService(dto);
  }

  public async findAllActiveServices(active: boolean) {
    return this.servicesRepository.findAllActive(active);
  }

  public async findAllServices() {
    return this.servicesRepository.findAll();
  }

  public async findServiceById(id: string) {
    return this.servicesRepository.findById(id);
  }

  public async updateService(id: string, dto: UpdateServiceDto) {
    return this.servicesRepository.updateService(id, dto);
  }
}
