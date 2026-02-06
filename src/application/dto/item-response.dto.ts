import { ApiProperty } from '@nestjs/swagger';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';

/**
 * DTO para representar la información del vendedor en las respuestas HTTP.
 * Transforma la entidad Seller del dominio a formato JSON para la API.
 */
export class SellerDto {
  @ApiProperty({ example: 123456789 })
  id: number;

  @ApiProperty({ example: 'VENDEDOR_OFICIAL' })
  nickname: string;

  @ApiProperty({ example: 'https://www.mercadolibre.com.ar/perfil/VENDEDOR', required: false })
  permalink?: string;

  /**
   * Método factory para crear un DTO desde la entidad de dominio.
   * 
   * @param seller - Entidad Seller del dominio
   * @returns DTO listo para serialización JSON
   */
  static fromDomain(seller: Seller): SellerDto {
    const dto = new SellerDto();
    dto.id = seller.id;
    dto.nickname = seller.nickname;
    dto.permalink = seller.permalink;
    return dto;
  }
}

/**
 * DTO para representar un atributo técnico del producto.
 * Los atributos describen características como marca, modelo, color, etc.
 */
export class ItemAttributeDto {
  @ApiProperty({ example: 'BRAND' })
  id: string;

  @ApiProperty({ example: 'Marca' })
  name: string;

  @ApiProperty({ example: 'Samsung' })
  valueName: string;

  /**
   * Transforma un atributo de dominio a DTO.
   * 
   * @param attribute - Entidad ItemAttribute del dominio
   * @returns DTO para respuesta HTTP
   */
  static fromDomain(attribute: ItemAttribute): ItemAttributeDto {
    const dto = new ItemAttributeDto();
    dto.id = attribute.id;
    dto.name = attribute.name;
    dto.valueName = attribute.valueName;
    return dto;
  }
}

/**
 * DTO principal para las respuestas de items en la API.
 * 
 * Transforma la entidad Item del dominio a formato JSON,
 * incluyendo decoradores de Swagger para documentación automática.
 * 
 * Usado en los endpoints:
 * - GET /api/v1/items/:id
 * - GET /api/v1/items/search
 */
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

  /**
   * Método factory para transformar una entidad de dominio a DTO.
   * 
   * Realiza el mapeo completo de la entidad Item incluyendo:
   * - Propiedades simples (id, title, price, etc.)
   * - Entidad anidada Seller
   * - Array de ItemAttribute
   * 
   * @param item - Entidad Item del dominio
   * @returns DTO completo listo para serialización JSON
   */
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
