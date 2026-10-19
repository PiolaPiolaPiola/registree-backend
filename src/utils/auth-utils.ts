import { AppError } from '../utils/app-error';
import type { Request } from 'express';

/**Para revalidar durante una petición que siga en sesión o autenticada la persona */
export const getUserIdAuth = (req: Request): string => {
  if (!req.user) {
    throw new AppError(401, 'No autenticado');
  }
  return req.user.sub;
};