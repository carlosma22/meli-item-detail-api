import { ApiProperty } from '@nestjs/swagger';
import { ItemResponseDto } from './item-response.dto';
import { Pagination } from '@domain/value-objects/pagination.vo';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;

  static fromDomain(pagination: Pagination): PaginationMetaDto {
    const dto = new PaginationMetaDto();
    const paginationObj = pagination.toObject();
    dto.page = paginationObj.page;
    dto.limit = paginationObj.limit;
    dto.total = paginationObj.total;
    dto.totalPages = paginationObj.totalPages;
    dto.hasNextPage = paginationObj.hasNextPage;
    dto.hasPreviousPage = paginationObj.hasPreviousPage;
    return dto;
  }
}

export class SearchResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  items: ItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  static fromDomain(items: any[], pagination: Pagination): SearchResponseDto {
    const dto = new SearchResponseDto();
    dto.items = items.map(ItemResponseDto.fromDomain);
    dto.meta = PaginationMetaDto.fromDomain(pagination);
    return dto;
  }
}
