import { Item } from '../../entities/item.entity';
import { Pagination } from '../../value-objects/pagination.vo';

export interface SearchItemsResult {
  items: Item[];
  pagination: Pagination;
}

export interface SearchItemsUseCase {
  execute(query: string, page: number, limit: number): Promise<SearchItemsResult>;
}

export const SEARCH_ITEMS_USE_CASE = Symbol('SEARCH_ITEMS_USE_CASE');
