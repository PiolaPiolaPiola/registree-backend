import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User, UserRole } from '../models/user.model';
import { Product } from '../models/product.model';
import { seedProducts } from './seed-products';

const DAY_MS = 24 * 60 * 60 * 1000;

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

    await seedProductsCatalog();
};

/** Crea los productos de prueba que no existan activos (por título). Si se eliminaron desde la app, se vuelven a crear */
const seedProductsCatalog = async (): Promise<void> => {
    const admin = await User.findOne({ email: 'admin@registree.com' });

    for (const { daysAgo, ...data } of seedProducts) {
        const exists = await Product.exists({ title: data.title, active: true });
        if (exists) {
            console.log(`El producto "${data.title}" ya existe y está activo, se omite`);
            continue;
        }

        // Se usan varias fechas para hacer variedad de escenarios
        const date = new Date(Date.now() - daysAgo * DAY_MS);
        await new Product({ ...data, active: true, createdBy: admin?._id, creationAt: date, updatedAt: date }).save({ timestamps: false });
        console.log(`Producto "${data.title}" creado`);
    }
};

seed()
    .catch((error) => {
        console.error('Error al ejecutar el seed:', error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
