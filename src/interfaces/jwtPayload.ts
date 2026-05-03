import { UserRole } from 'src/utils/enums/UserRole';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
