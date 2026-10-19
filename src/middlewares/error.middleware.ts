import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/app-error';

/**Código 11000 para key repetida*/
const isDuplicateKeyError = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

/**Manejador centralizado de errores */
export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    //Validaciones del schema (required, maxlength, match, etc.)
    if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map((err) => err.message);
        res.status(400).json({ message: 'Datos inválidos', errors });
        return;
    }

    if (error instanceof mongoose.Error.CastError) {
        res.status(400).json({ message: `Valor inválido para el campo ${error.path}` });
        return;
    }

    if (isDuplicateKeyError(error)) {
        res.status(409).json({ message: 'El email ya está registrado' });
        return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
        return;
    }

    console.error('Error no controlado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
};
