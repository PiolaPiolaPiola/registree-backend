import type { UserRole } from '../models/user.model';
import type { PaginationParams } from './pagination';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export interface UserFilters extends PaginationParams {
  active?: boolean;
}