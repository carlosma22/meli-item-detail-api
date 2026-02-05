import { Test, TestingModule } from '@nestjs/testing';
import { MeliItemRepository } from './meli-item.repository';
import { HTTP_CLIENT_PORT } from '@domain/ports/outbound/http-client.port';
import { CACHE_PORT } from '@domain/ports/outbound/cache.port';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '@/shared/services/metrics.service';
import { SearchQuery } from '@domain/value-objects/search-query.vo';

describe('MeliItemRepository', () => {
  let repository: MeliItemRepository;
  let mockHttpClient: any;
  let mockCache: any;
  let mockConfigService: any;
  let mockMetricsService: any;

  const mockItemResponse = {
    id: 'MLA123456789',
    title: 'Test Item',
    price: 1000,
    currency_id: 'ARS',
    available_quantity: 10,
    condition: 'new',
    thumbnail: 'http://example.com/thumb.jpg',
    pictures: [{ url: 'http://example.com/pic1.jpg' }],
    seller: { id: 123, nickname: 'Test Seller', permalink: 'http://seller.com' },
    attributes: [{ id: 'BRAND', name: 'Brand', value_name: 'Test Brand' }],
    category_id: 'MLA1234',
    permalink: 'http://example.com/item',
  };

  const mockDescriptionResponse = {
    plain_text: 'Test description',
    snapshot: { url: 'http://example.com/snapshot.jpg', width: 800, height: 600 },
  };

  beforeEach(async () => {
    mockHttpClient = {
      get: jest.fn(),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      keys: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'meli.apiBaseUrl') return 'https://api.mercadolibre.com';
        if (key === 'redis.ttl') return 3600;
        return defaultValue;
      }),
    };

    mockMetricsService = {
      incrementCacheHits: jest.fn(),
      incrementCacheMisses: jest.fn(),
      incrementExternalApiCalls: jest.fn(),
      incrementExternalApiErrors: jest.fn(),
      observeExternalApiDuration: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeliItemRepository,
        {
          provide: HTTP_CLIENT_PORT,
          useValue: mockHttpClient,
        },
        {
          provide: CACHE_PORT,
          useValue: mockCache,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    repository = module.get<MeliItemRepository>(MeliItemRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return item from cache when available', async () => {
      const mockItem = { id: 'MLA123456789', title: 'Test Item' };
      mockCache.get.mockResolvedValue(mockItem);

      const result = await repository.findById('MLA123456789');

      expect(result).toEqual(mockItem);
      expect(mockCache.get).toHaveBeenCalledWith('item:MLA123456789');
      expect(mockMetricsService.incrementCacheHits).toHaveBeenCalledWith('item');
    });

    it('should return null when item not in cache', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await repository.findById('MLA999999999');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementCacheMisses).toHaveBeenCalledWith('item');
    });
  });

  describe('findDescription', () => {
    it('should return description from cache when available', async () => {
      const mockDescription = { itemId: 'MLA123456789', plainText: 'Test description' };
      mockCache.get.mockResolvedValue(mockDescription);

      const result = await repository.findDescription('MLA123456789');

      expect(result).toEqual(mockDescription);
      expect(mockCache.get).toHaveBeenCalledWith('description:MLA123456789');
      expect(mockMetricsService.incrementCacheHits).toHaveBeenCalledWith('description');
    });

    it('should return null when description not in cache', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await repository.findDescription('MLA999999999');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementCacheMisses).toHaveBeenCalledWith('description');
    });
  });

  describe('search', () => {
    it('should return items from cache', async () => {
      const searchQuery = new SearchQuery('test', 1, 10);
      const mockItems = [{ id: 'MLA123456789', title: 'Test Item' }];

      mockCache.keys.mockResolvedValue(['item:MLA123456789']);
      mockCache.get.mockResolvedValue(mockItems[0]);

      const result = await repository.search(searchQuery);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return empty array when no items in cache', async () => {
      const searchQuery = new SearchQuery('test', 1, 10);

      mockCache.keys.mockResolvedValue([]);

      const result = await repository.search(searchQuery);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter items by query text', async () => {
      const searchQuery = new SearchQuery('laptop', 1, 10);
      const mockItems = [
        { id: 'MLA1', title: 'Laptop Dell' },
        { id: 'MLA2', title: 'Mouse Logitech' },
      ];

      mockCache.keys.mockResolvedValue(['item:MLA1', 'item:MLA2']);
      mockCache.get
        .mockResolvedValueOnce(mockItems[0])
        .mockResolvedValueOnce(mockItems[1]);

      const result = await repository.search(searchQuery);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toContain('Laptop');
    });
  });

  describe('loadItemFromApi', () => {
    it('should load item from API and cache it', async () => {
      mockHttpClient.get.mockResolvedValue(mockItemResponse);

      const result = await repository.loadItemFromApi('MLA123456789');

      expect(result).toBeDefined();
      expect(result?.id).toBe('MLA123456789');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/items/MLA123456789',
      );
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockMetricsService.incrementExternalApiCalls).toHaveBeenCalledWith('mercadolibre', '/items/:id', 'success');
    });

    it('should return null when item not found in API', async () => {
      mockHttpClient.get.mockRejectedValue({ response: { status: 404 } });

      const result = await repository.loadItemFromApi('MLA999999999');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementExternalApiCalls).toHaveBeenCalledWith('mercadolibre', '/items/:id', 'error');
    });

    it('should return null and log error when API fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const result = await repository.loadItemFromApi('MLA123456789');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementExternalApiErrors).toHaveBeenCalledWith('mercadolibre', '/items/:id', 'Network error');
    });
  });

  describe('loadDescriptionFromApi', () => {
    it('should load description from API and cache it', async () => {
      mockHttpClient.get.mockResolvedValue(mockDescriptionResponse);

      const result = await repository.loadDescriptionFromApi('MLA123456789');

      expect(result).toBeDefined();
      expect(result?.itemId).toBe('MLA123456789');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/items/MLA123456789/description',
      );
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockMetricsService.incrementExternalApiCalls).toHaveBeenCalledWith('mercadolibre', '/items/:id/description', 'success');
    });

    it('should return null when description not found in API', async () => {
      mockHttpClient.get.mockRejectedValue({ response: { status: 404 } });

      const result = await repository.loadDescriptionFromApi('MLA999999999');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementExternalApiCalls).toHaveBeenCalledWith('mercadolibre', '/items/:id/description', 'error');
    });

    it('should return null and log error when API fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const result = await repository.loadDescriptionFromApi('MLA123456789');

      expect(result).toBeNull();
      expect(mockMetricsService.incrementExternalApiErrors).toHaveBeenCalledWith('mercadolibre', '/items/:id/description', 'Network error');
    });
  });

  describe('search', () => {
    it('should handle errors when searching in Redis', async () => {
      const searchQuery = new SearchQuery('test', 1, 10);
      mockCache.keys.mockRejectedValue(new Error('Redis connection error'));

      const result = await repository.search(searchQuery);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('loadSearchFromApi', () => {
    const mockSearchResponse = {
      results: [mockItemResponse],
      paging: { total: 1, offset: 0, limit: 10 },
    };

    it('should load search results from API and cache them', async () => {
      const searchQuery = new SearchQuery('laptop', 1, 10);
      mockHttpClient.get.mockResolvedValue(mockSearchResponse);

      const result = await repository.loadSearchFromApi(searchQuery);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search',
        { params: { offset: 0, limit: 10, q: 'laptop' } },
      );
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should load all items when query is empty', async () => {
      const searchQuery = new SearchQuery('', 1, 10);
      mockHttpClient.get.mockResolvedValue(mockSearchResponse);

      const result = await repository.loadSearchFromApi(searchQuery);

      expect(result.items).toHaveLength(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.mercadolibre.com/sites/MLA/search',
        { params: { offset: 0, limit: 10 } },
      );
    });

    it('should return empty array when API fails', async () => {
      const searchQuery = new SearchQuery('laptop', 1, 10);
      mockHttpClient.get.mockRejectedValue(new Error('API error'));

      const result = await repository.loadSearchFromApi(searchQuery);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
