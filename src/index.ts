import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {env} from './config/env';
import {connectDB} from './config/database';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFound } from './middlewares/not-found.middleware';

const app = express();

app.use(cors({origin: env.corsOrigin}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({status: 'Ok', database_connected: dbConnected});
});

app.use(notFound);
app.use(errorHandler);

const startServer = async(): Promise<void> => {
    try{
        await connectDB();
        app.listen(env.port, () => {
            console.log(`Servidor corriendo en http://localhost:${env.port}`);
        })
    }
    catch(error){
        console.error('No se pudo iniciar el servidor', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    await mongoose.connection.close(); //Se hace cuando se tumba manualmente el servidor
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
})

startServer();