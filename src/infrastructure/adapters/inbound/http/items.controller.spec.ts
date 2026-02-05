import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { GET_ITEM_USE_CASE } from '@domain/ports/inbound/get-item.use-case';
import { GET_ITEM_DESCRIPTION_USE_CASE } from '@domain/ports/inbound/get-item-description.use-case';
import { SEARCH_ITEMS_USE_CASE } from '@domain/ports/inbound/search-items.use-case';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';
import { ItemDescription } from '@domain/entities/item-description.entity';

describe('ItemsController', () => {
  let controller: ItemsController;
  let mockGetItemUseCase: any;
  let mockGetItemDescriptionUseCase: any;
  let mockSearchItemsUseCase: any;

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

  const mockDescription = new ItemDescription('MLA123456789', 'Test description');

  beforeEach(async () => {
    mockGetItemUseCase = {
      execute: jest.fn(),
    };

    mockGetItemDescriptionUseCase = {
      execute: jest.fn(),
    };

    mockSearchItemsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: GET_ITEM_USE_CASE,
          useValue: mockGetItemUseCase,
        },
        {
          provide: GET_ITEM_DESCRIPTION_USE_CASE,
          useValue: mockGetItemDescriptionUseCase,
        },
        {
          provide: SEARCH_ITEMS_USE_CASE,
          useValue: mockSearchItemsUseCase,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getItem', () => {
    it('should return an item', async () => {
      mockGetItemUseCase.execute.mockResolvedValue(mockItem);

      const result = await controller.getItem('MLA123456789');

      expect(result).toBeDefined();
      expect(result.id).toBe('MLA123456789');
      expect(mockGetItemUseCase.execute).toHaveBeenCalledWith('MLA123456789');
    });
  });

  describe('getDescription', () => {
    it('should return item description', async () => {
      mockGetItemDescriptionUseCase.execute.mockResolvedValue(mockDescription);

      const result = await controller.getDescription('MLA123456789');

      expect(result).toBeDefined();
      expect(result.itemId).toBe('MLA123456789');
      expect(mockGetItemDescriptionUseCase.execute).toHaveBeenCalledWith('MLA123456789');
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockPagination = {
        toObject: () => ({
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      };

      const mockSearchResult = {
        items: [mockItem],
        pagination: mockPagination,
      };

      mockSearchItemsUseCase.execute.mockResolvedValue(mockSearchResult);

      const result = await controller.search({ query: 'test', page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(mockSearchItemsUseCase.execute).toHaveBeenCalledWith('test', 1, 10);
    });

    it('should handle empty query', async () => {
      const mockPagination = {
        toObject: () => ({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      };

      const mockSearchResult = {
        items: [],
        pagination: mockPagination,
      };

      mockSearchItemsUseCase.execute.mockResolvedValue(mockSearchResult);

      const result = await controller.search({ query: '', page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(0);
      expect(mockSearchItemsUseCase.execute).toHaveBeenCalledWith('', 1, 10);
    });
  });
});
