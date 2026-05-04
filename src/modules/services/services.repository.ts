import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from 'src/interfaces/service.interface';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesRepository {
  constructor(private db: DatabaseService) {}

  public async createService(dto: CreateServiceDto): Promise<Service> {
    const { data, error } = await this.db
      .getClient()
      .from('services')
      .insert(dto)
      .select()
      .single<Service>();

    if (error) throw new Error(error.message);

    return data;
  }

  public async findAll(): Promise<Service[]> {
    const { data, error } = await this.db
      .getClient()
      .from('services')
      .select('id, active, durationMinutes, name, price');

    if (error) throw new InternalServerErrorException(error.message);

    return data ?? [];
  }

  public async findAllActive(active: boolean): Promise<Service[]> {
    const { data, error } = await this.db
      .getClient()
      .from('services')
      .select('id, active, durationMinutes, name, price')
      .eq('active', active);

    if (error || !data) throw new Error(error.message);

    return data ?? [];
  }

  public async findById(id: string): Promise<Service> {
    const { data, error } = await this.db
      .getClient()
      .from('services')
      .select('id, active, durationMinutes, name, price')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) throw new NotFoundException('Usuário não encontrado');

    return data;
  }

  public async updateService(
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    await this.findById(id);

    const updatePayload = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );

    const { data, error } = await this.db
      .getClient()
      .from('services')
      .update(updatePayload)
      .eq('id', id)
      .select('id, active, durationMinutes, name, price, createdAt, updatedAt')
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }
}
