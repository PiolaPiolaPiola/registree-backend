import { isObjectIdOrHexString } from 'mongoose';
import { AppError } from './app-error';

/**Para validar que el id tenga formato de ObjectId*/
export const ensureValidId = (id: string, entity: string): void => {
  if (!isObjectIdOrHexString(id)) {
    throw new AppError(400, `El id del ${entity} no es válido`);
  }
};