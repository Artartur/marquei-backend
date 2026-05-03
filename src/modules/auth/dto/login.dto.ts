import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password é obrigatório' })
  @IsString()
  @MinLength(6)
  password: string;
}
