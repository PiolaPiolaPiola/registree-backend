import type { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { AppError } from '../utils/app-error';
import { parsePagination } from '../utils/pagination';
import { parseBooleanParam } from '../utils/query-params';
import { pick } from '../utils/pick';
import { getUserIdAuth } from '../utils/auth-utils';
import type { CreateUserDTO, UpdateUserDTO } from '../types/user.types';

/**Campos que corresponden al request definitivo */
const CREATE_FIELDS = ['name', 'email', 'password', 'role'] as const;
const UPDATE_FIELDS = ['name', 'email', 'password', 'role', 'active'] as const;

/** GET /api/users: Filtra con paginación y filtro opcional por estado */
export const listUsers = async (req: Request, res: Response) => {
  const { offset, limit } = parsePagination(req.query);
  const active = parseBooleanParam(req.query.active, 'active') ?? true;//Por defecto activos

  const result = await userService.listUsers({ offset, limit, active });
  res.status(200).json(result);
};

/** GET /api/users/:id: obtiene detalle de un usuario */
export const getUser = async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(user);
};

/** POST /api/users: crea un usuario */
export const createUser = async (req: Request, res: Response) => {
  const dto = pick(req.body, CREATE_FIELDS) as CreateUserDTO;
  const user = await userService.createUser(dto);
  res.status(201).json(user);
};

/** PATCH /api/users/:id: actualiza la información del usuario */
export const updateUser = async (req: Request<{ id: string }>, res: Response) => {
  const dto = pick(req.body, UPDATE_FIELDS) as UpdateUserDTO;
  if (Object.keys(dto).length === 0) {
    throw new AppError(400, 'Debe enviar al menos un campo para actualizar');
  }
  const user = await userService.updateUser(req.params.id, dto, getUserIdAuth(req));
  res.status(200).json(user);
};

/** PATCH /api/users/:id/status: activa o desactiva un usuario */
export const setUserStatus = async (req: Request<{ id: string }>, res: Response) => {
  const { active } = req.body ?? {};
  if (typeof active !== 'boolean') {
    throw new AppError(400, 'El campo active es obligatorio y debe ser true o false');
  }
  const user = await userService.setUserStatus(req.params.id, active, getUserIdAuth(req));
  res.status(200).json(user);
};