import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface PaginationParams<T extends ObjectLiteral> {
  readonly limit?: number;
  readonly page?: number;
  queryBuilder?: SelectQueryBuilder<T>;
}

export interface PaginationResult<T> {
  data: T[];
  count: number;
  currentPage: number;
  totalPage: number;
}
