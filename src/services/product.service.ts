import { Types, isObjectIdOrHexString, HydratedDocument, QueryFilter  } from 'mongoose';
import { Product } from '../models/product.model';
import { AppError } from '../utils/app-error';
import type { CreateProductDTO, ProductFilters, UpdateProductDTO } from '../types/product.types';
import type { IProduct } from '../models/product.model';
import type { PaginatedResult } from '../types/pagination';

/**Para validar que el id tenga formato de ObjectId*/
const ensureValidId = (id: string): void => {
  if (!isObjectIdOrHexString(id)) {
    throw new AppError(400, 'El id del producto no es válido');
  }
};

/** Expresión regular para evitar que el servidor interprete texto como expresiones regulares*/
const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Obtener de colección con filtros.
 * @Params Propiedades del type ProductFilters
 * @returns Los productos segun los filtros y el total count. Por defecto llegan activos e inactivos
 */
export const listProducts = async (
  filters: ProductFilters,
): Promise<PaginatedResult<HydratedDocument<IProduct>>> => {
  const { offset, limit, search, from, to } = filters;
  const query: QueryFilter<IProduct> = { active: true };

  if (search) {
    query.title = { $regex: escapeRegex(search), $options: 'i' };
  }

  if (from || to) {
    const dateRange: { $gte?: Date; $lte?: Date } = {};
    if (from) dateRange.$gte = from;
    if (to) dateRange.$lte = to;
    query.creationAt = dateRange;
  }

  const [data, total] = await Promise.all([
    Product.find(query)
      .sort({ creationAt: -1, _id: -1 }) //Se ordena descendentemente. Últimos registro creados
      .skip(offset)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return { data, total, offset, limit };
};

/**
 * Obtiene un producto por id.
 * @param includeInactive true solo para ADMIN. USER no puede ver productos inactivos.
 */
export const getProductById = async (id: string, includeInactive = false) => {
  ensureValidId(id);

  const filter = includeInactive ? { _id: id } : { _id: id, active: true };
  const product = await Product.findOne(filter);

  if (!product) {
    throw new AppError(404, 'Producto no encontrado');
  }
  return product;
};

/**
 * Crea un producto y guarda registró de quien lo creó.
 * @param dto De tipo CreateProductDTO
 * @param userId Id del usuario autenticado con permisos
 */
export const createProduct = async (dto: CreateProductDTO, userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  return Product.create({
    ...dto,
    createdBy: userObjectId,
    updatedBy: userObjectId,
  });
};

/** Actualiza el producto y registra quién lo modificó.*/
export const updateProduct = async (id: string, dto: UpdateProductDTO, userId: string) => {
  const product = await getProductById(id, true); 

  product.set({ 
    ...dto, 
    updatedBy: new Types.ObjectId(userId) 
  });

  return product.save();
};

/**Inactivar productos (soft delete)*/
export const deactivateProduct = async (id: string, userId: string) => {
  const product = await getProductById(id, true);

  if (!product.active) {
    return product;
  }

  product.set({ active: false, updatedBy: new Types.ObjectId(userId) });
  return product.save();
};