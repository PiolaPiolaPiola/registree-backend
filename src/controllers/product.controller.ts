import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { UserRole } from '../models/user.model';
import { AppError } from '../utils/app-error';
import { parsePagination } from '../utils/pagination';
import { pick } from '../utils/pick';
import { getUserIdAuth } from '../utils/auth-utils';
import type { CreateProductDTO, UpdateProductDTO } from '../types/product.types';
import { parseDateParam, parseSearchParam } from '../utils/query-params';

/**Campos que corresponden al request definitivo */
const CREATE_FIELDS = ['title', 'description', 'price', 'category', 'stock', 'images'] as const;
const UPDATE_FIELDS = [...CREATE_FIELDS, 'active'] as const;

const isAdmin = (req: Request): boolean => req.user?.role === UserRole.ADMIN;

/** GET /api/products: lista con paginación, búsqueda por título y rango de fechas */
export const listProducts = async (req: Request, res: Response) => {
  const { offset, limit } = parsePagination(req.query);
  const search = parseSearchParam(req.query.search);
  const from = parseDateParam(req.query.from, 'from', 'start');
  const to = parseDateParam(req.query.to, 'to', 'end');

  if (from && to && from > to) {
    throw new AppError(400, 'La fecha from no puede ser posterior a la fecha to');
  }

  const result = await productService.listProducts({ offset, limit, search, from, to });
  res.status(200).json(result);
};

/** GET /api/products/:id: detalle. Un USER no puede ver productos inactivos. Respuesta será 404 */
export const getProduct = async (req: Request<{ id: string }>, res: Response) => {
  const product = await productService.getProductById(req.params.id, isAdmin(req));
  res.status(200).json(product);
};

/** POST /api/products: crea un producto*/
export const createProduct = async (req: Request, res: Response) => {
  const dto = pick(req.body, CREATE_FIELDS) as CreateProductDTO;
  const product = await productService.createProduct(dto, getUserIdAuth(req));
  res.status(201).json(product);
};

/** PATCH /api/products/:id: actualiza la información del producto*/
export const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
  const dto = pick(req.body, UPDATE_FIELDS) as UpdateProductDTO;
  if (Object.keys(dto).length === 0) {
    throw new AppError(400, 'Debe enviar al menos un campo para actualizar');
  }
  const product = await productService.updateProduct(req.params.id, dto, getUserIdAuth(req));
  res.status(200).json(product);
};

/** DELETE /api/products/:id: soft delete, solo inactiva y no borra*/
export const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
  const product = await productService.deactivateProduct(req.params.id, getUserIdAuth(req));
  res.status(200).json({ message: 'Producto eliminado correctamente', product });
};