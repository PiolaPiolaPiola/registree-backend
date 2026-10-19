import type { PaginationParams } from './pagination';

export interface CreateProductDTO {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
}

export type UpdateProductDTO = Partial<CreateProductDTO> & {
    active?: boolean;
}

/**Filtros de búsqueda para API de listar */
export interface ProductFilters extends PaginationParams{
  search?: string;
  from?: Date;
  to?: Date;
}