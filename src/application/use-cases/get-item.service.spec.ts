import { Test, TestingModule } from '@nestjs/testing';
import { GetItemService } from './get-item.service';
import { ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';
import { MetricsService } from '@/shared/services/metrics.service';

describe('GetItemService', () => {
  let service: GetItemService;
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
      findById: jest.fn(),
    };

    mockMetricsService = {
      incrementItemsRetrieved: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetItemService,
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

    service = module.get<GetItemService>(GetItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should return an item when found', async () => {
      mockRepository.findById.mockResolvedValue(mockItem);

      const result = await service.execute('MLA123456789');

      expect(result).toEqual(mockItem);
      expect(mockRepository.findById).toHaveBeenCalledWith('MLA123456789');
      expect(mockMetricsService.incrementItemsRetrieved).toHaveBeenCalledWith('success');
    });

    it('should throw error when item not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.execute('MLA999999999')).rejects.toThrow();
      expect(mockMetricsService.incrementItemsRetrieved).toHaveBeenCalledWith('not_found');
    });

    it('should increment error metric when repository throws error', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.execute('MLA123456789')).rejects.toThrow();
      expect(mockMetricsService.incrementItemsRetrieved).toHaveBeenCalledWith('error');
    });
  });
});
