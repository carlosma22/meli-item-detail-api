import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ItemsController } from '../adapters/inbound/http/items.controller';
import { GetItemService } from '@application/use-cases/get-item.service';
import { GetItemDescriptionService } from '@application/use-cases/get-item-description.service';
import { SearchItemsService } from '@application/use-cases/search-items.service';
import { MeliItemRepository } from '../adapters/outbound/meli-item.repository';
import { AxiosHttpClientAdapter } from '../adapters/outbound/axios-http-client.adapter';
import { RedisCacheAdapter } from '../adapters/outbound/redis-cache.adapter';
import { DataSeederService } from '../services/data-seeder.service';
import { GET_ITEM_USE_CASE } from '@domain/ports/inbound/get-item.use-case';
import { GET_ITEM_DESCRIPTION_USE_CASE } from '@domain/ports/inbound/get-item-description.use-case';
import { SEARCH_ITEMS_USE_CASE } from '@domain/ports/inbound/search-items.use-case';
import { ITEM_REPOSITORY_PORT } from '@domain/ports/outbound/item.repository.port';
import { HTTP_CLIENT_PORT } from '@domain/ports/outbound/http-client.port';
import { CACHE_PORT } from '@domain/ports/outbound/cache.port';

@Module({
  imports: [HttpModule],
  controllers: [ItemsController],
  providers: [
    {
      provide: GET_ITEM_USE_CASE,
      useClass: GetItemService,
    },
    {
      provide: GET_ITEM_DESCRIPTION_USE_CASE,
      useClass: GetItemDescriptionService,
    },
    {
      provide: SEARCH_ITEMS_USE_CASE,
      useClass: SearchItemsService,
    },
    {
      provide: ITEM_REPOSITORY_PORT,
      useClass: MeliItemRepository,
    },
    {
      provide: HTTP_CLIENT_PORT,
      useClass: AxiosHttpClientAdapter,
    },
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    DataSeederService,
  ],
})
export class ItemsModule {}
