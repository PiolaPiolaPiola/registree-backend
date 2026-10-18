import 'dotenv/config';

/**Para que al arrancar no hayan errores por falta de variables de entorno, se valida que existan*/
const required = (name: string): string => {
    const value = process.env[name];
    if (!value){
        throw new Error(`Falta la variable de entorno ${name}`);
    }
    return value;
};

/**Se aplica la validación de required() a las variables de entorno */
export const env = {
    port: Number(process.env.PORT) || 3000,
    mongoUri: required('MONGO_URI'),
    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    
};