import { Inject, Injectable, Logger } from '@nestjs/common';
import { SearchItemsUseCase, SearchItemsResult } from '@domain/ports/inbound/search-items.use-case';
import { ItemRepositoryPort, ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { SearchQuery } from '@domain/value-objects/search-query.vo';
import { Pagination } from '@domain/value-objects/pagination.vo';
import { InvalidSearchQueryException } from '@domain/exceptions/domain.exception';
import { MetricsService } from '@/shared/services/metrics.service';

@Injectable()
export class SearchItemsService implements SearchItemsUseCase {
  private readonly logger = new Logger(SearchItemsService.name);

  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(query: string, page: number, limit: number): Promise<SearchItemsResult> {
    this.logger.log(`Searching items: query="${query}", page=${page}, limit=${limit}`);

    try {
      const searchQuery = new SearchQuery(query, page, limit);
      const result = await this.itemRepository.search(searchQuery);

      const pagination = new Pagination(page, limit, result.total);

      this.logger.log(`Found ${result.items.length} items out of ${result.total} total`);
      this.metricsService.incrementItemSearches('success');

      return {
        items: result.items,
        pagination,
      };
    } catch (error) {
      this.metricsService.incrementItemSearches('error');
      if (error instanceof Error) {
        this.logger.error(`Search failed: ${error.message}`);
        throw new InvalidSearchQueryException(error.message);
      }
      throw error;
    }
  }
}
