import {Request, Response} from 'express';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/app-error';

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

/** POST /api/auth/register: registra un usuario con rol USER y devuelve el usuario y su token */
export const register = async (req: Request, res: Response) => {
    
    const { name, email, password } = req.body ?? {};
    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)){
        throw new AppError(400, 'Los campos name, email y password son obligatorios')
    }

    const result = await authService.register({name, email, password});

    res.status(201).json(result);
}

/** POST /api/auth/login: valida las credenciales y devuelve el usuario y su token */
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)){
        throw new AppError(400, 'Los campos email y password son obligatorios')
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
}

/** GET /api/auth/me: devuelve el usuario autenticado (requiere el authenticate) */
export const me = async (req: Request, res: Response) => {
  res.status(200).json(req.user);
};
