import { ItemDescription } from '../../entities/item-description.entity';

export interface GetItemDescriptionUseCase {
  execute(id: string): Promise<ItemDescription>;
}

export const GET_ITEM_DESCRIPTION_USE_CASE = Symbol('GET_ITEM_DESCRIPTION_USE_CASE');
