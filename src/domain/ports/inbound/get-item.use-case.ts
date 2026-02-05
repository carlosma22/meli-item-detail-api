import { Item } from '../../entities/item.entity';

export interface GetItemUseCase {
  execute(id: string): Promise<Item>;
}

export const GET_ITEM_USE_CASE = Symbol('GET_ITEM_USE_CASE');
