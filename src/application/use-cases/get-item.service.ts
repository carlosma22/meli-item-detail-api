import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetItemUseCase } from '@domain/ports/inbound/get-item.use-case';
import { Item } from '@domain/entities/item.entity';
import { ItemRepositoryPort, ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { ItemNotFoundException } from '@domain/exceptions/domain.exception';
import { MetricsService } from '@/shared/services/metrics.service';

@Injectable()
export class GetItemService implements GetItemUseCase {
  private readonly logger = new Logger(GetItemService.name);

  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(id: string): Promise<Item> {
    this.logger.log(`Fetching item with ID: ${id}`);

    try {
      const item = await this.itemRepository.findById(id);

      if (!item) {
        this.logger.warn(`Item not found: ${id}`);
        this.metricsService.incrementItemsRetrieved('not_found');
        throw new ItemNotFoundException(id);
      }

      this.logger.log(`Item found: ${id}`);
      this.metricsService.incrementItemsRetrieved('success');
      return item;
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw error;
      }
      this.metricsService.incrementItemsRetrieved('error');
      throw error;
    }
  }
}
