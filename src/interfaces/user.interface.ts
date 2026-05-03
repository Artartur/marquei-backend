import { UserRole } from 'src/utils/enums/UserRole';

export interface User {
  id: string;
  cpf: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
