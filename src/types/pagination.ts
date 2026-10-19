export interface PaginationParams {
    limit: number;
    offset: number;
}

export interface PaginatedResult<T> extends PaginationParams {
    data: T[]; //Se usa genérico para reutilizarlo en productos y usuarios
    total: number;
}

