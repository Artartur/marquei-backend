import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  public async createUser(dto: CreateUserDto) {
    return this.usersRepository.createUser(dto);
  }

  public async findUserByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  public async findUserById(id: string) {
    return this.usersRepository.findById(id);
  }
}
