import { ApiProperty } from '@nestjs/swagger';
import { ItemDescription, ItemDescriptionSnapshot } from '@domain/entities/item-description.entity';

export class ItemDescriptionSnapshotDto {
  @ApiProperty({ example: 'https://http2.mlstatic.com/storage/description-snapshot.jpg' })
  url: string;

  @ApiProperty({ example: 800 })
  width: number;

  @ApiProperty({ example: 600 })
  height: number;

  static fromDomain(snapshot: ItemDescriptionSnapshot): ItemDescriptionSnapshotDto {
    const dto = new ItemDescriptionSnapshotDto();
    dto.url = snapshot.url;
    dto.width = snapshot.width;
    dto.height = snapshot.height;
    return dto;
  }
}

export class ItemDescriptionResponseDto {
  @ApiProperty({ example: 'MLA123456789' })
  itemId: string;

  @ApiProperty({ example: 'Descripción completa del producto...' })
  plainText: string;

  @ApiProperty({ type: ItemDescriptionSnapshotDto, required: false })
  snapshot?: ItemDescriptionSnapshotDto;

  static fromDomain(description: ItemDescription): ItemDescriptionResponseDto {
    const dto = new ItemDescriptionResponseDto();
    dto.itemId = description.itemId;
    dto.plainText = description.plainText;
    dto.snapshot = description.snapshot
      ? ItemDescriptionSnapshotDto.fromDomain(description.snapshot)
      : undefined;
    return dto;
  }
}
