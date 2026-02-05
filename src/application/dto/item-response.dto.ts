import { ApiProperty } from '@nestjs/swagger';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';

export class SellerDto {
  @ApiProperty({ example: 123456789 })
  id: number;

  @ApiProperty({ example: 'VENDEDOR_OFICIAL' })
  nickname: string;

  @ApiProperty({ example: 'https://www.mercadolibre.com.ar/perfil/VENDEDOR', required: false })
  permalink?: string;

  static fromDomain(seller: Seller): SellerDto {
    const dto = new SellerDto();
    dto.id = seller.id;
    dto.nickname = seller.nickname;
    dto.permalink = seller.permalink;
    return dto;
  }
}

export class ItemAttributeDto {
  @ApiProperty({ example: 'BRAND' })
  id: string;

  @ApiProperty({ example: 'Marca' })
  name: string;

  @ApiProperty({ example: 'Samsung' })
  valueName: string;

  static fromDomain(attribute: ItemAttribute): ItemAttributeDto {
    const dto = new ItemAttributeDto();
    dto.id = attribute.id;
    dto.name = attribute.name;
    dto.valueName = attribute.valueName;
    return dto;
  }
}

export class ItemResponseDto {
  @ApiProperty({ example: 'MLA123456789' })
  id: string;

  @ApiProperty({ example: 'Samsung Galaxy S21 128GB' })
  title: string;

  @ApiProperty({ example: 89999.99 })
  price: number;

  @ApiProperty({ example: 'ARS' })
  currencyId: string;

  @ApiProperty({ example: 10 })
  availableQuantity: number;

  @ApiProperty({ example: 'new' })
  condition: string;

  @ApiProperty({ example: 'https://http2.mlstatic.com/D_123456-MLA.jpg' })
  thumbnail: string;

  @ApiProperty({ type: [String] })
  pictures: string[];

  @ApiProperty({ type: SellerDto })
  seller: SellerDto;

  @ApiProperty({ type: [ItemAttributeDto] })
  attributes: ItemAttributeDto[];

  @ApiProperty({ example: 'MLA1055', required: false })
  categoryId?: string;

  @ApiProperty({ example: 'https://www.mercadolibre.com.ar/...', required: false })
  permalink?: string;

  static fromDomain(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.title = item.title;
    dto.price = item.price;
    dto.currencyId = item.currencyId;
    dto.availableQuantity = item.availableQuantity;
    dto.condition = item.condition;
    dto.thumbnail = item.thumbnail;
    dto.pictures = item.pictures;
    dto.seller = SellerDto.fromDomain(item.seller);
    dto.attributes = item.attributes.map(ItemAttributeDto.fromDomain);
    dto.categoryId = item.categoryId;
    dto.permalink = item.permalink;
    return dto;
  }
}
