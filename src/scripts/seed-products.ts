import type { CreateProductDTO } from '../types/product.types';

export interface SeedProduct extends CreateProductDTO {
  daysAgo: number;
}

/**Productos de prueba para que la aplicación tenga datos al iniciar.*/
export const seedProducts: SeedProduct[] = [
  {
    title: 'Árbol Nativo Guayacán Amarillo',
    description: 'Material vegetal de vivero para proyectos de reforestación y compensación ambiental. Altura promedio 1.2 metros.',
    price: 35000,
    category: 'Material Vegetal',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 28,
  },
  {
    title: 'Abono Orgánico Compostado 25kg',
    description: 'Sustrato orgánico enriquecido para mejoramiento de suelos y nutrición vegetal en siembras masivas.',
    price: 42500,
    category: 'Insumos Agronómicos',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 25,
  },
  {
    title: 'Kit de Monitoreo de Calidad de Agua',
    description: 'Equipo portátil para medición de pH, turbidez y oxígeno disuelto en fuentes hídricas en campo.',
    price: 850000,
    category: 'Equipos de Monitoreo',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 21,
  },
  {
    title: 'Malla Geotextil No Tejida 100m',
    description: 'Rollo de geotextil para control de erosión, estabilización de taludes y obras de drenaje ambiental.',
    price: 320000,
    category: 'Control de Erosión',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 18,
  },
  {
    title: 'Hidrogel Retendor de Agua 1kg',
    description: 'Polímero de alta capacidad de retención de humedad para siembras en épocas de sequía.',
    price: 28000,
    category: 'Insumos Agronómicos',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 15,
  },
  {
    title: 'Medidor de cloro',
    description: 'Mide la cantidad correcta de cloro en tanques y piscinas.',
    price: 700000,
    category: 'Medidores normativos',
    stock: 23,
    images: ['https://tree-a.com.co/wp-content/uploads/2024/12/PL1-1024x1024-1.webp'],
    daysAgo: 12,
  },
  {
    title: 'Cloro piscina',
    description: 'Cloro neutralizante para piscinas.',
    price: 20000,
    category: 'Piscinas',
    stock: 0,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQqjHaId0YVS-i0RQghnEdtZcqaTA-TpBQuEq81cKsXA&s'],
    daysAgo: 10,
  },
  {
    title: 'Kit de Prueba de Suelos NPK',
    description: 'Kit para medir nitrógeno, fósforo y potasio en campo. Incluye reactivos para 40 pruebas.',
    price: 210000,
    category: 'Equipos de Monitoreo',
    stock: 18,
    // Varias imágenes: la primera es la principal
    images: [
      'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    ],
    daysAgo: 7,
  },
  {
    title: 'Aspersor Rotativo de Impacto',
    description: 'Aspersor metálico de impacto para riego de cultivos y zonas verdes, con alcance de hasta 12 metros.',
    price: 64900.5,
    category: 'Riego',
    stock: 40,
    // URL que no carga: el frontend muestra la imagen por defecto
    images: ['https://imagen-no-disponible.invalid/aspersor.png'],
    daysAgo: 5,
  },
  {
    title: 'Manguera de Riego por Goteo 100m',
    description: 'Cinta de goteo con emisores cada 30 cm para riego eficiente en huertas y viveros.',
    price: 185000,
    category: 'Riego',
    stock: 3,
    // Sin imágenes
    images: [],
    daysAgo: 3,
  },
  {
    title: 'Semilla de Pasto Brachiaria 10kg',
    description: 'Semilla certificada para recuperación de suelos degradados y cobertura de taludes.',
    price: 156000,
    category: 'Semillas',
    stock: 0,
    images: [],
    daysAgo: 2,
  },
  {
    title: 'Bomba Sumergible 1HP',
    description: 'Bomba sumergible para extracción de agua de pozos y reservorios, caudal de hasta 80 litros por minuto.',
    price: 980000,
    category: 'Equipos de Bombeo',
    stock: 6,
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80'],
    daysAgo: 1,
  },
];
