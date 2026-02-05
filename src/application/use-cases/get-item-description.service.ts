import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetItemDescriptionUseCase } from '@domain/ports/inbound/get-item-description.use-case';
import { ItemDescription } from '@domain/entities/item-description.entity';
import {
  ItemRepositoryPort,
  ITEM_REPOSITORY_PORT,
} from '@domain/ports/outbound/item.repository.port';
import { ItemDescriptionNotFoundException } from '@domain/exceptions/domain.exception';

@Injectable()
export class GetItemDescriptionService implements GetItemDescriptionUseCase {
  private readonly logger = new Logger(GetItemDescriptionService.name);

  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
  ) {}

  async execute(id: string): Promise<ItemDescription> {
    this.logger.log(`Fetching description for item: ${id}`);

    const description = await this.itemRepository.findDescription(id);

    if (!description) {
      this.logger.warn(`Description not found for item: ${id}`);
      throw new ItemDescriptionNotFoundException(id);
    }

    this.logger.log(`Description found for item: ${id}`);
    return description;
  }
}
