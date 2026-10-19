import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User, UserRole } from '../models/user.model';

/**Credenciales de prueba*/
const seedUsers = [
    {
        name: 'Administrador Registree',
        email: 'admin@registree.com',
        password: 'Admin12345',
        role: UserRole.ADMIN,
    },
    {
        name: 'Usuario Registree',
        email: 'user@registree.com',
        password: 'User12345',
        role: UserRole.USER,
    },
];

const seed = async (): Promise<void> => {
    await connectDB();

    for (const data of seedUsers) {
        const exists = await User.exists({ email: data.email });
        if (exists) {
            console.log(`El usuario ${data.email} ya existe, se omite`);
            continue;
        }

        await User.create(data);
        console.log(`Usuario ${data.email} creado con rol ${data.role}`);
    }
};

seed()
    .catch((error) => {
        console.error('Error al ejecutar el seed:', error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
