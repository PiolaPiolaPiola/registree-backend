import { Request, Response } from 'express';

/**Por si ninguna ruta coincide con la petición */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};