import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/interfaces/user.interface';
import { UserRole } from 'src/utils/enums/UserRole';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByManagerDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import { UpdateMeDto } from '../auth/dto/update-me.dto';

@Injectable()
export class UsersRepository {
  constructor(private db: DatabaseService) {}

  public async createUser(dto: CreateUserDto) {
    const { data: existing } = await this.db
      .getClient()
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();

    if (existing) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { data, error } = await this.db
      .getClient()
      .from('users')
      .insert({ ...dto, password: hashedPassword, role: UserRole.CLIENT })
      .select('id, cpf, email, name, phone, role, created_at, updated_at')
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  public async findAll(): Promise<User[]> {
    const { data, error } = await this.db
      .getClient()
      .from('users')
      .select('id, cpf, email, name, phone, role');

    if (error) throw new InternalServerErrorException(error.message);

    return data as User[];
  }

  public async findByCpf(cpf: string) {
    const { data, error } = await this.db
      .getClient()
      .from('users')
      .select('id, cpf, email, name, phone, role')
      .eq('cpf', cpf)
      .maybeSingle();

    if (error || !data) throw new NotFoundException('Usuário não encontrado');

    return data;
  }

  public async findByEmail(email: string, isAuth?: boolean): Promise<User> {
    const fields = isAuth
      ? 'id, cpf, email, name, phone, role, password'
      : 'id, cpf, email, name, phone, role';

    const response = await this.db
      .getClient()
      .from('users')
      .select(fields)
      .eq('email', email)
      .maybeSingle();

    if (response.error) throw new NotFoundException('Usuário não encontrado');

    return response.data as unknown as User;
  }

  public async findById(id: string): Promise<User> {
    const { data, error } = await this.db
      .getClient()
      .from('users')
      .select('id, cpf, email, name, phone, role')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) throw new NotFoundException('Usuário não encontrado');

    return data as User;
  }

  public async updateMe(userId: string, dto: UpdateMeDto) {
    const dataToUpdate: Record<string, string> = {};

    if (dto.name) dataToUpdate.name = dto.name;
    if (dto.phone) dataToUpdate.phone = dto.phone;
    if (dto.cpf) dataToUpdate.cpf = dto.cpf;

    if (Object.keys(dataToUpdate).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }
    if (dto.cpf) {
      const { data: existing } = await this.db
        .getClient()
        .from('users')
        .select('id')
        .eq('cpf', dto.cpf)
        .neq('id', userId)
        .maybeSingle();

      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const { data, error } = await this.db
      .getClient()
      .from('users')
      .update(dataToUpdate)
      .eq('id', userId)
      .select('id, cpf, email, name, phone, role, created_at, updated_at')
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  public async updateUser(id: string, dto: UpdateUserByManagerDto) {
    const user = await this.findById(id);

    const updatePayload = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );

    const { data, error } = await this.db
      .getClient()
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('id, cpf, email, name, phone, role, created_at, updated_at')
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    if (dto.role && dto.role !== user.role) {
      if (dto.role === UserRole.PROFESSIONAL) {
        await this.db.getClient().from('professionals').insert({ userId: id });
      } else if (user.role === UserRole.PROFESSIONAL) {
        await this.db
          .getClient()
          .from('professionals')
          .delete()
          .eq('userId', id);
      }
    }

    return data;
  }
}
