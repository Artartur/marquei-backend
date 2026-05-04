import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty({ message: 'Está ativo ou inativo, é obrigatório' })
  @IsBoolean()
  active: boolean;

  @IsNotEmpty({ message: 'Duração em minutos é obrigatório' })
  @IsNumber()
  durationMinutes: number;

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Preço é obrigatório' })
  @IsNumber()
  price: number;
}
