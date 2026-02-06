import { Controller, Get, Param, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetItemUseCase, GET_ITEM_USE_CASE } from '@domain/ports/inbound/get-item.use-case';
import {
  GetItemDescriptionUseCase,
  GET_ITEM_DESCRIPTION_USE_CASE,
} from '@domain/ports/inbound/get-item-description.use-case';
import {
  SearchItemsUseCase,
  SEARCH_ITEMS_USE_CASE,
} from '@domain/ports/inbound/search-items.use-case';
import { ItemResponseDto } from '@application/dto/item-response.dto';
import { ItemDescriptionResponseDto } from '@application/dto/item-description-response.dto';
import { SearchResponseDto } from '@application/dto/search-response.dto';
import { SearchQueryDto } from '@application/dto/search-query.dto';

/**
 * Controlador REST para operaciones relacionadas con items/productos.
 * 
 * Este es un adaptador de entrada (Inbound Adapter) en la arquitectura hexagonal.
 * Recibe requests HTTP, las transforma en llamadas a casos de uso del dominio,
 * y convierte las respuestas del dominio a DTOs para HTTP.
 * 
 * Endpoints disponibles:
 * - GET /items/search - Buscar productos con paginación
 * - GET /items/:id - Obtener detalle de un producto
 * - GET /items/:id/description - Obtener descripción de un producto
 */
@ApiTags('items')
@Controller('items')
export class ItemsController {
  /**
   * Constructor con inyección de casos de uso.
   * Inyecta los puertos (interfaces) en lugar de implementaciones concretas.
   * 
   * @param getItemUseCase - Caso de uso para obtener un item
   * @param getItemDescriptionUseCase - Caso de uso para obtener descripción
   * @param searchItemsUseCase - Caso de uso para buscar items
   */
  constructor(
    @Inject(GET_ITEM_USE_CASE)
    private readonly getItemUseCase: GetItemUseCase,
    @Inject(GET_ITEM_DESCRIPTION_USE_CASE)
    private readonly getItemDescriptionUseCase: GetItemDescriptionUseCase,
    @Inject(SEARCH_ITEMS_USE_CASE)
    private readonly searchItemsUseCase: SearchItemsUseCase,
  ) {}

  /**
   * Endpoint para buscar productos.
   * 
   * Permite búsquedas con filtrado por query y paginación.
   * Si el query está vacío, retorna todos los items disponibles.
   * 
   * @param searchQuery - DTO con parámetros de búsqueda (query, page, limit)
   * @returns DTO con array de items y objeto de paginación
   * 
   * @example
   * GET /api/v1/items/search?query=laptop&page=1&limit=10
   * GET /api/v1/items/search?page=1&limit=20 (retorna todos los items)
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search items (query is optional, if empty returns all items)' })
  @ApiResponse({ status: 200, description: 'Search results', type: SearchResponseDto })
  async search(@Query() searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    const result = await this.searchItemsUseCase.execute(
      searchQuery.query || '',
      searchQuery.page || 1,
      searchQuery.limit || 10,
    );
    return SearchResponseDto.fromDomain(result.items, result.pagination);
  }

  /**
   * Endpoint para obtener el detalle completo de un producto por ID.
   * 
   * Los datos se obtienen desde Redis (estrategia Redis-First).
   * Si el producto no existe, retorna 404.
   * 
   * @param id - Identificador único del producto (ej: MLA1100002000)
   * @returns DTO con toda la información del producto
   * @throws ItemNotFoundException (convertida a 404 por el exception filter)
   * 
   * @example
   * GET /api/v1/items/MLA1100002000
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiParam({ name: 'id', example: 'MLA1100002000' })
  @ApiResponse({ status: 200, description: 'Item found', type: ItemResponseDto })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getItem(@Param('id') id: string): Promise<ItemResponseDto> {
    const item = await this.getItemUseCase.execute(id);
    return ItemResponseDto.fromDomain(item);
  }

  /**
   * Endpoint para obtener la descripción detallada de un producto.
   * 
   * La descripción incluye texto plano y opcionalmente una imagen snapshot.
   * Los datos se obtienen desde Redis.
   * 
   * @param id - Identificador del producto
   * @returns DTO con la descripción del producto
   * @throws ItemDescriptionNotFoundException (convertida a 404)
   * 
   * @example
   * GET /api/v1/items/MLA1100002000/description
   */
  @Get(':id/description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get item description' })
  @ApiParam({ name: 'id', example: 'MLA1100002000' })
  @ApiResponse({ status: 200, description: 'Description found', type: ItemDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Description not found' })
  async getDescription(@Param('id') id: string): Promise<ItemDescriptionResponseDto> {
    const description = await this.getItemDescriptionUseCase.execute(id);
    return ItemDescriptionResponseDto.fromDomain(description);
  }
}
