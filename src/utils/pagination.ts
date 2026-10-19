import type { PaginationParams } from '../types/pagination';
import { AppError } from './app-error';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**Garantiza que limit y offset siempre sean enteros validos. 
 * Se usa unknown para forzar la validación de tipo*/
const parseIntegerParam = (value: unknown, name: string): number | undefined => {
  if (value === undefined || value === '') return undefined;

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError(400, `El parámetro ${name} debe ser un número entero mayor o igual a 0`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new AppError(400, `El parámetro ${name} es demasiado grande`);
  }
  return parsed;
};

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const offset = parseIntegerParam(query.offset, 'offset') ?? 0;
  const limit = parseIntegerParam(query.limit, 'limit') ?? DEFAULT_LIMIT;

  if (limit < 1 || limit > MAX_LIMIT) {
    throw new AppError(400, `El parámetro limit debe estar entre 1 y ${MAX_LIMIT}`);
  }

  return { offset, limit };
};