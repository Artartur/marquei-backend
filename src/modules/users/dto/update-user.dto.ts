import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/utils/enums/UserRole';

export class UpdateUserByManagerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
