import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(2, 45)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
