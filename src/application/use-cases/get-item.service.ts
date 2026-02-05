import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetItemUseCase } from '@domain/ports/inbound/get-item.use-case';
import { Item } from '@domain/entities/item.entity';
import { ItemRepositoryPort, ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { ItemNotFoundException } from '@domain/exceptions/domain.exception';

@Injectable()
export class GetItemService implements GetItemUseCase {
  private readonly logger = new Logger(GetItemService.name);

  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
  ) {}

  async execute(id: string): Promise<Item> {
    this.logger.log(`Fetching item with ID: ${id}`);

    const item = await this.itemRepository.findById(id);

    if (!item) {
      this.logger.warn(`Item not found: ${id}`);
      throw new ItemNotFoundException(id);
    }

    this.logger.log(`Item found: ${id}`);
    return item;
  }
}
