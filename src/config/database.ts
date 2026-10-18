import mongoose from 'mongoose';
import {env} from './env';


/**En tiempo de ejecución valida y establece la conexión a la bd dejando logs*/
export const connectDB = async (): Promise<void> => {
    mongoose.connection.on('disconnected', () => {
        console.warn('La bd se encuentra desconectada');
    });
    mongoose.connection.on('error', (error) => {
        console.error('Error al intentar conectar la bd', error);
    });

    await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
    });

    console.log('Bd conectada');
}