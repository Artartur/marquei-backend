import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/utils/enums/UserRole';

export class CreateUserDto {
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString()
  cpf: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Senha é obrigatório' })
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
