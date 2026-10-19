import type { UserRole } from '../models/user.model';

/** Datos del usuario autenticado que se validan en las peticiones */
export interface JwtPayloadCustom {
    sub: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloadCustom;
        }
    }
}
