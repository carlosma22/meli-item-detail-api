import { Controller, Get, Param, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetItemUseCase, GET_ITEM_USE_CASE } from '@domain/ports/inbound/get-item.use-case';
import { GetItemDescriptionUseCase, GET_ITEM_DESCRIPTION_USE_CASE } from '@domain/ports/inbound/get-item-description.use-case';
import { SearchItemsUseCase, SEARCH_ITEMS_USE_CASE } from '@domain/ports/inbound/search-items.use-case';
import { ItemResponseDto } from '@application/dto/item-response.dto';
import { ItemDescriptionResponseDto } from '@application/dto/item-description-response.dto';
import { SearchResponseDto } from '@application/dto/search-response.dto';
import { SearchQueryDto } from '@application/dto/search-query.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(GET_ITEM_USE_CASE)
    private readonly getItemUseCase: GetItemUseCase,
    @Inject(GET_ITEM_DESCRIPTION_USE_CASE)
    private readonly getItemDescriptionUseCase: GetItemDescriptionUseCase,
    @Inject(SEARCH_ITEMS_USE_CASE)
    private readonly searchItemsUseCase: SearchItemsUseCase,
  ) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search items (query is optional, if empty returns all items)' })
  @ApiResponse({ status: 200, description: 'Search results', type: SearchResponseDto })
  async search(
    @Query() searchQuery: SearchQueryDto,
  ): Promise<SearchResponseDto> {
    const result = await this.searchItemsUseCase.execute(
      searchQuery.query || '',
      searchQuery.page || 1,
      searchQuery.limit || 10,
    );
    return SearchResponseDto.fromDomain(result.items, result.pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiParam({ name: 'id', example: 'MLA123456789' })
  @ApiResponse({ status: 200, description: 'Item found', type: ItemResponseDto })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getItem(@Param('id') id: string): Promise<ItemResponseDto> {
    const item = await this.getItemUseCase.execute(id);
    return ItemResponseDto.fromDomain(item);
  }

  @Get(':id/description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get item description' })
  @ApiParam({ name: 'id', example: 'MLA123456789' })
  @ApiResponse({ status: 200, description: 'Description found', type: ItemDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Description not found' })
  async getDescription(@Param('id') id: string): Promise<ItemDescriptionResponseDto> {
    const description = await this.getItemDescriptionUseCase.execute(id);
    return ItemDescriptionResponseDto.fromDomain(description);
  }
}
