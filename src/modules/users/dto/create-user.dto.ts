import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: '12345678901' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString()
  cpf: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'strongpassword', minLength: 6 })
  @IsNotEmpty({ message: 'Senha é obrigatório' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '11999999999' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.CLIENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
