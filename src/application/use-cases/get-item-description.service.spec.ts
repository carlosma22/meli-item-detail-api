import { Test, TestingModule } from '@nestjs/testing';
import { GetItemDescriptionService } from './get-item-description.service';
import { ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { ItemDescription } from '@domain/entities/item-description.entity';
import { ItemDescriptionNotFoundException } from '@domain/exceptions/domain.exception';

describe('GetItemDescriptionService', () => {
  let service: GetItemDescriptionService;
  let mockRepository: any;

  const mockDescription = new ItemDescription(
    'MLA123456789',
    'This is a test item description with detailed information about the product.',
  );

  beforeEach(async () => {
    mockRepository = {
      findDescription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetItemDescriptionService,
        {
          provide: ITEM_REPOSITORY_PORT,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GetItemDescriptionService>(GetItemDescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should return item description when found', async () => {
      mockRepository.findDescription.mockResolvedValue(mockDescription);

      const result = await service.execute('MLA123456789');

      expect(result).toEqual(mockDescription);
      expect(mockRepository.findDescription).toHaveBeenCalledWith('MLA123456789');
    });

    it('should throw ItemDescriptionNotFoundException when description not found', async () => {
      mockRepository.findDescription.mockResolvedValue(null);

      await expect(service.execute('MLA999999999')).rejects.toThrow(
        ItemDescriptionNotFoundException,
      );
    });

    it('should throw error when repository throws error', async () => {
      mockRepository.findDescription.mockRejectedValue(new Error('Database error'));

      await expect(service.execute('MLA123456789')).rejects.toThrow('Database error');
    });
  });
});
