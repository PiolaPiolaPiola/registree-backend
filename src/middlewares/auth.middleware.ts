import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, UserRole } from '../models/user.model';

/**Verifica si el token y los headers son válidos*/
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')){
            res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token){
            res.status(401).json({ message: 'Token inválido o malformado.' });
            return;
        }

        const decoded = jwt.verify(token, env.jwtSecret);

        if (typeof decoded === 'string' || !decoded.sub) {
            res.status(401).json({ message: 'Token inválido o malformado.' });
            return;
        }

        const user = await User.findById(decoded.sub);
        if (!user || !user.active){
            res.status(401).json({ message: 'Usuario no encontrado o inactivo.' });
            return;
        }

        req.user = {
            sub: user.id,
            role: user.role,
        };

        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Token inválido o expirado.' });
            return;
        }
        next(error);
    }
};

/**
 * Permite el acceso solo a al rol o roles correspondientes. Debe usarse después de `authenticate`.
 * @param allowedRoles Roles que pueden acceder a la ruta
 */
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if(!req.user){
            res.status(401).json({ message: 'No autenticado.' });
            return;
        }

        if(!allowedRoles.includes(req.user.role)){
            res.status(403).json({ message: 'No tiene permisos para realizar esta acción.' });
            return;
        }

        next();
    }
}
