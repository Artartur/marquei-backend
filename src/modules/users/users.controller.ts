import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums/UserRole';
import { UpdateUserByManagerDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new user (Manager only)' })
  public createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'List all users (Manager only)' })
  public findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('/professionals')
  @ApiOperation({ summary: 'List all users with professional profile' })
  public findProfessionals() {
    return this.usersService.findUsersByProfessionals();
  }

  @Get('cpf/:cpf')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Find user by CPF (Manager only)' })
  public findUserByCpf(@Param('cpf') cpf: string) {
    return this.usersService.findUserByCpf(cpf);
  }

  @Get('id/:id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Find user by ID (Manager only)' })
  public findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get('email/:email')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Find user by email (Manager only)' })
  public findUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user by ID (Manager only)' })
  public updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserByManagerDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }
}
