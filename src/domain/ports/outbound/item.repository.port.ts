import { Item } from '../../entities/item.entity';
import { ItemDescription } from '../../entities/item-description.entity';
import { SearchQuery } from '../../value-objects/search-query.vo';

export interface SearchResult {
  items: Item[];
  total: number;
}

export interface ItemRepositoryPort {
  findById(id: string): Promise<Item | null>;
  findDescription(id: string): Promise<ItemDescription | null>;
  search(searchQuery: SearchQuery): Promise<SearchResult>;
}

export const ITEM_REPOSITORY_PORT = Symbol('ITEM_REPOSITORY_PORT');
