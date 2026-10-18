import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {env} from './config/env';
import {connectDB} from './config/database';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({status: 'Ok', database_connected: dbConnected});
});

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