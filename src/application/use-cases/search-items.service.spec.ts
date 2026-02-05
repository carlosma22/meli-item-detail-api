import { Test, TestingModule } from '@nestjs/testing';
import { SearchItemsService } from './search-items.service';
import { ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';
import { MetricsService } from '@/shared/services/metrics.service';

describe('SearchItemsService', () => {
  let service: SearchItemsService;
  let mockRepository: any;
  let mockMetricsService: any;

  const mockItem = new Item(
    'MLA123456789',
    'Test Item',
    1000,
    'ARS',
    10,
    'new',
    'http://example.com/thumb.jpg',
    ['http://example.com/pic1.jpg'],
    new Seller(123, 'Test Seller', 'http://seller.com'),
    [new ItemAttribute('BRAND', 'Brand', 'Test Brand')],
    'MLA1234',
    'http://example.com/item',
  );

  beforeEach(async () => {
    mockRepository = {
      search: jest.fn(),
    };

    mockMetricsService = {
      incrementItemSearches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchItemsService,
        {
          provide: ITEM_REPOSITORY_PORT,
          useValue: mockRepository,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<SearchItemsService>(SearchItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should return search results with pagination', async () => {
      const mockResults = {
        items: [mockItem],
        total: 1,
      };

      mockRepository.search.mockResolvedValue(mockResults);

      const result = await service.execute('test', 1, 10);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(result.items).toEqual([mockItem]);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(mockMetricsService.incrementItemSearches).toHaveBeenCalledWith('success');
    });

    it('should return empty results when no items found', async () => {
      mockRepository.search.mockResolvedValue({ items: [], total: 0 });

      const result = await service.execute('nonexistent', 1, 10);

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(mockMetricsService.incrementItemSearches).toHaveBeenCalledWith('success');
    });

    it('should handle pagination correctly', async () => {
      const mockResults = {
        items: [mockItem],
        total: 100,
      };

      mockRepository.search.mockResolvedValue(mockResults);

      const result = await service.execute('test', 2, 20);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.getTotalPages()).toBe(5);
      expect(result.pagination.hasNextPage()).toBe(true);
      expect(result.pagination.hasPreviousPage()).toBe(true);
    });

    it('should increment error metric when search fails', async () => {
      mockRepository.search.mockRejectedValue(new Error('Search error'));

      await expect(service.execute('test', 1, 10)).rejects.toThrow();
      expect(mockMetricsService.incrementItemSearches).toHaveBeenCalledWith('error');
    });
  });
});
