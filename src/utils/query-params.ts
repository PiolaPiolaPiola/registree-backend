import { AppError } from './app-error';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SEARCH_LENGTH = 100;

const TIMEZONE_OFFSET = '-05:00'; //Se usará UTC Colombia para fechas.

/** Castea el formato YYYY-MM-DD a Date UTC */
export const parseDateParam = (value: unknown, name: string, boundary: 'start' | 'end'): Date | undefined => {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
    throw new AppError(400, `El parámetro ${name} debe tener el formato YYYY-MM-DD`);
  }

  const calendarCheck = new Date(value);
  if (Number.isNaN(calendarCheck.getTime()) || calendarCheck.toISOString().slice(0, 10) !== value) {
    throw new AppError(400, `El parámetro ${name} no es una fecha válida`);
  }

  const time = boundary === 'start' ? '00:00:00.000' : '23:59:59.999';
  return new Date(`${value}T${time}${TIMEZONE_OFFSET}`);
};

/**Convierte true o false en bool*/
export const parseBooleanParam = (value: unknown, name: string): boolean | undefined => {
  if (value === undefined || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(400, `El parámetro ${name} debe ser true o false`);
};

/** Limita el texto de consulta a 100 caracteres y a texto */
export const parseSearchParam = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new AppError(400, 'El parámetro search debe ser un texto');
  }
  const search = value.trim();
  if (search.length > MAX_SEARCH_LENGTH) {
    throw new AppError(400, `El parámetro search puede tener máximo ${MAX_SEARCH_LENGTH} caracteres`);
  }
  return search || undefined; 
};