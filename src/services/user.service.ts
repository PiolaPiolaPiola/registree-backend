import type { HydratedDocument, QueryFilter } from 'mongoose';
import { User, type IUser } from '../models/user.model';
import { AppError } from '../utils/app-error';
import { ensureValidId } from '../utils/object-id';
import type { PaginatedResult } from '../types/pagination';
import type { CreateUserDTO, UpdateUserDTO, UserFilters } from '../types/user.types';

/**Obtener colección usuarios con paginación y filtro por estado.*/
export const listUsers = async (
  filters: UserFilters,
): Promise<PaginatedResult<HydratedDocument<IUser>>> => {
  const { offset, limit, active } = filters;
  const query: QueryFilter<IUser> = {};

  if (active !== undefined) {
    query.active = active;
  }

  const [data, total] = await Promise.all([
    User.find(query).sort({ creationAt: -1, _id: -1 }).skip(offset).limit(limit),
    User.countDocuments(query),
  ]);

  return { data, total, offset, limit };
};

/**Obtiene un usuario por id */
export const getUserById = async (id: string) => {
  ensureValidId(id, 'usuario');

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  return user;
};

/**Crea un usuario*/
export const createUser = async (dto: CreateUserDTO) => User.create(dto);

/**
 * Actualiza nombre, rol, contraseña, email o estado de un usuario. Un ADMIN no puede inactivarse ni cambiarse el rol a sí mismo.
 * @param currentUserId Id del ADMIN que hace la petición
 */
export const updateUser = async (id: string, dto: UpdateUserDTO, currentUserId: string) => {
  const user = await getUserById(id);
  const isSelf = user.id === currentUserId;

  if (isSelf && dto.active === false) {
    throw new AppError(400, 'No es posible actualizar su propio estado'); //Desde el front se oculta el campo
  }
  if (isSelf && dto.role !== undefined && dto.role !== user.role) {
    throw new AppError(400, 'No puede cambiar su propio rol'); //Desde el front se oculta el campo
  }

  user.set(dto);
  return user.save();
};

/** Activa o descactiva un usuario*/
export const setUserStatus = async (id: string, active: boolean, currentUserId: string) =>
  updateUser(id, { active }, currentUserId);