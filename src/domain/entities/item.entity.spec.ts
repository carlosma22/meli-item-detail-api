import { Item, Seller, ItemAttribute } from './item.entity';

describe('Item Entity', () => {
  const mockSeller = new Seller(123, 'Test Seller', 'http://seller.com');
  const mockAttributes = [new ItemAttribute('BRAND', 'Brand', 'Test Brand')];

  describe('Item', () => {
    it('should create a valid item', () => {
      const item = new Item(
        'MLA123456789',
        'Test Item',
        1000,
        'ARS',
        10,
        'new',
        'http://example.com/thumb.jpg',
        ['http://example.com/pic1.jpg'],
        mockSeller,
        mockAttributes,
        'MLA1234',
        'http://example.com/item',
      );

      expect(item).toBeDefined();
      expect(item.id).toBe('MLA123456789');
      expect(item.title).toBe('Test Item');
      expect(item.price).toBe(1000);
    });

    it('should throw error for invalid id', () => {
      expect(() => {
        new Item(
          '',
          'Test Item',
          1000,
          'ARS',
          10,
          'new',
          'http://example.com/thumb.jpg',
          ['http://example.com/pic1.jpg'],
          mockSeller,
          mockAttributes,
          'MLA1234',
          'http://example.com/item',
        );
      }).toThrow('Item ID is required');
    });

    it('should throw error for invalid title', () => {
      expect(() => {
        new Item(
          'MLA123456789',
          '',
          1000,
          'ARS',
          10,
          'new',
          'http://example.com/thumb.jpg',
          ['http://example.com/pic1.jpg'],
          mockSeller,
          mockAttributes,
          'MLA1234',
          'http://example.com/item',
        );
      }).toThrow('Item title is required');
    });

    it('should throw error for negative price', () => {
      expect(() => {
        new Item(
          'MLA123456789',
          'Test Item',
          -100,
          'ARS',
          10,
          'new',
          'http://example.com/thumb.jpg',
          ['http://example.com/pic1.jpg'],
          mockSeller,
          mockAttributes,
          'MLA1234',
          'http://example.com/item',
        );
      }).toThrow('Item price cannot be negative');
    });

    it('should identify new items correctly', () => {
      const newItem = new Item(
        'MLA123456789',
        'Test Item',
        1000,
        'ARS',
        10,
        'new',
        'http://example.com/thumb.jpg',
        ['http://example.com/pic1.jpg'],
        mockSeller,
        mockAttributes,
        'MLA1234',
        'http://example.com/item',
      );

      expect(newItem.isNew()).toBe(true);
    });

    it('should identify used items correctly', () => {
      const usedItem = new Item(
        'MLA123456789',
        'Test Item',
        1000,
        'ARS',
        10,
        'used',
        'http://example.com/thumb.jpg',
        ['http://example.com/pic1.jpg'],
        mockSeller,
        mockAttributes,
        'MLA1234',
        'http://example.com/item',
      );

      expect(usedItem.isNew()).toBe(false);
    });

    it('should check availability correctly', () => {
      const availableItem = new Item(
        'MLA123456789',
        'Test Item',
        1000,
        'ARS',
        10,
        'new',
        'http://example.com/thumb.jpg',
        ['http://example.com/pic1.jpg'],
        mockSeller,
        mockAttributes,
        'MLA1234',
        'http://example.com/item',
      );

      expect(availableItem.isAvailable()).toBe(true);
    });

    it('should format price correctly', () => {
      const item = new Item(
        'MLA123456789',
        'Test Item',
        1000.5,
        'ARS',
        10,
        'new',
        'http://example.com/thumb.jpg',
        ['http://example.com/pic1.jpg'],
        mockSeller,
        mockAttributes,
        'MLA1234',
        'http://example.com/item',
      );

      expect(item.getFormattedPrice()).toBe('ARS 1000.50');
    });
  });

  describe('Seller', () => {
    it('should create a valid seller', () => {
      const seller = new Seller(123, 'Test Seller', 'http://seller.com');

      expect(seller).toBeDefined();
      expect(seller.id).toBe(123);
      expect(seller.nickname).toBe('Test Seller');
    });
  });

  describe('ItemAttribute', () => {
    it('should create a valid attribute', () => {
      const attribute = new ItemAttribute('BRAND', 'Brand', 'Test Brand');

      expect(attribute).toBeDefined();
      expect(attribute.id).toBe('BRAND');
      expect(attribute.name).toBe('Brand');
      expect(attribute.valueName).toBe('Test Brand');
    });
  });
});
