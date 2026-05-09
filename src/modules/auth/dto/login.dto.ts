import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword', minLength: 6 })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  @IsString()
  @MinLength(6)
  password: string;
}
