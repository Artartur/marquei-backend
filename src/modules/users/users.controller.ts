import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { UpdateUserByManagerDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  @Roles(UserRole.MANAGER)
  public createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('')
  @Roles(UserRole.MANAGER)
  public findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('cpf/:cpf')
  @Roles(UserRole.MANAGER)
  public findUserByCpf(@Param('cpf') cpf: string) {
    return this.usersService.findUserByCpf(cpf);
  }

  @Get('id/:id')
  @Roles(UserRole.MANAGER)
  public findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get('email/:email')
  @Roles(UserRole.MANAGER)
  public findUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  public updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserByManagerDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }
}
