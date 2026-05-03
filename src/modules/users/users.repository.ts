import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/interfaces/user.interface';

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
      .insert({ ...dto, password: hashedPassword })
      .select('id, cpf, email, name, phone, role, created_at, updated_at')
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  public async findByEmail(email: string): Promise<User> {
    const response = await this.db
      .getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (response.error) throw new NotFoundException('Usuário não encontrado');

    return response.data as User;
  }

  public async findById(id: string) {
    const { data, error } = await this.db
      .getClient()
      .from('users')
      .select('id, cpf, email, name, phone, role, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) throw new NotFoundException('Usuário não encontrado');
    return data;
  }
}
