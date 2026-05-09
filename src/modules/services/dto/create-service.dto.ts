import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: true })
  @IsNotEmpty({ message: 'Está ativo ou inativo, é obrigatório' })
  @IsBoolean()
  active: boolean;

  @ApiProperty({ example: 60 })
  @IsNotEmpty({ message: 'Duração em minutos é obrigatório' })
  @IsNumber()
  durationMinutes: number;

  @ApiProperty({ example: 'Haircut' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ example: 50.0 })
  @IsNotEmpty({ message: 'Preço é obrigatório' })
  @IsNumber()
  price: number;
}
