/** Estandarizar errores en formato json*/
export class AppError extends Error {
    constructor(public statusCode: number, message: string){
        super(message);
    }
}
