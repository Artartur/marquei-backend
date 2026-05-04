import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByManagerDto } from './dto/update-user.dto';
import { UpdateMeDto } from '../auth/dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  public async createUser(dto: CreateUserDto) {
    return this.usersRepository.createUser(dto);
  }

  public async findAllUsers() {
    return this.usersRepository.findAll();
  }

  public async findUserByCpf(cpf: string) {
    return this.usersRepository.findByCpf(cpf);
  }

  public async findUserByEmail(email: string, isAuth?: boolean) {
    return this.usersRepository.findByEmail(email, isAuth);
  }

  public async findUserById(id: string) {
    return this.usersRepository.findById(id);
  }

  public async updateMe(userId: string, dto: UpdateMeDto) {
    return this.usersRepository.updateMe(userId, dto);
  }

  public async updateUser(id: string, dto: UpdateUserByManagerDto) {
    return this.usersRepository.updateUser(id, dto);
  }
}
