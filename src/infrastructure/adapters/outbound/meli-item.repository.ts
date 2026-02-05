import { Inject, Injectable, Logger } from '@nestjs/common';
import { ItemRepositoryPort, SearchResult } from '@domain/ports/outbound/item.repository.port';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';
import { ItemDescription, ItemDescriptionSnapshot } from '@domain/entities/item-description.entity';
import { SearchQuery } from '@domain/value-objects/search-query.vo';
import { HttpClientPort, HTTP_CLIENT_PORT } from '@domain/ports/outbound/http-client.port';
import { CachePort, CACHE_PORT } from '@domain/ports/outbound/cache.port';
import { ConfigService } from '@nestjs/config';

interface MeliItemResponse {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  condition: string;
  thumbnail: string;
  pictures: Array<{ url: string }>;
  seller: { id: number; nickname: string; permalink?: string };
  attributes: Array<{ id: string; name: string; value_name: string }>;
  category_id?: string;
  permalink?: string;
}

interface MeliDescriptionResponse {
  plain_text: string;
  snapshot?: { url: string; width: number; height: number };
}

interface MeliSearchResponse {
  results: MeliItemResponse[];
  paging: { total: number; offset: number; limit: number };
}

@Injectable()
export class MeliItemRepository implements ItemRepositoryPort {
  private readonly logger = new Logger(MeliItemRepository.name);
  private readonly baseUrl: string;
  private readonly cacheTtl: number;

  constructor(
    @Inject(HTTP_CLIENT_PORT) private readonly httpClient: HttpClientPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('meli.apiBaseUrl', 'https://api.mercadolibre.com');
    this.cacheTtl = this.configService.get<number>('redis.ttl', 3600);
  }

  async findById(id: string): Promise<Item | null> {
    const cacheKey = `item:${id}`;
    
    // SOLO consulta Redis, NO va a la API de MercadoLibre
    const cached = await this.cache.get<Item>(cacheKey);
    if (cached) {
      this.logger.log(`Item found in cache: ${id}`);
      return cached;
    }

    this.logger.warn(`Item not found in cache: ${id}`);
    return null;
  }

  // Método público para cargar item desde API (usado solo por data seeder)
  async loadItemFromApi(id: string): Promise<Item | null> {
    const cacheKey = `item:${id}`;
    
    try {
      this.logger.log(`Loading item from API for seeding: ${id}`);
      const url = `${this.baseUrl}/items/${id}`;
      const response = await this.httpClient.get<MeliItemResponse>(url);
      
      const item = this.mapToItemEntity(response);
      await this.cache.set(cacheKey, item, this.cacheTtl);
      
      return item;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        this.logger.debug(`Item not found in API: ${id}`);
        return null;
      }
      
      this.logger.error(`Error loading item ${id}: ${error?.message || error}`);
      return null;
    }
  }

  async findDescription(id: string): Promise<ItemDescription | null> {
    const cacheKey = `description:${id}`;
    
    // SOLO consulta Redis, NO va a la API de MercadoLibre
    const cached = await this.cache.get<ItemDescription>(cacheKey);
    if (cached) {
      this.logger.log(`Description found in cache: ${id}`);
      return cached;
    }

    this.logger.warn(`Description not found in cache: ${id}`);
    return null;
  }

  // Método público para cargar descripción desde API (usado solo por data seeder)
  async loadDescriptionFromApi(id: string): Promise<ItemDescription | null> {
    const cacheKey = `description:${id}`;
    
    try {
      this.logger.log(`Loading description from API for seeding: ${id}`);
      const url = `${this.baseUrl}/items/${id}/description`;
      const response = await this.httpClient.get<MeliDescriptionResponse>(url);
      
      const description = this.mapToDescriptionEntity(id, response);
      await this.cache.set(cacheKey, description, this.cacheTtl);
      
      return description;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        this.logger.debug(`Description not found in API: ${id}`);
        return null;
      }
      
      this.logger.error(`Error loading description ${id}: ${error?.message || error}`);
      return null;
    }
  }

  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    const queryObj = searchQuery.toObject();
    const queryText = queryObj.query.toLowerCase();
    
    try {
      // Obtener todas las claves de items en Redis
      const itemKeys = await this.cache.keys('item:*');
      this.logger.log(`Found ${itemKeys.length} items in Redis`);

      if (itemKeys.length === 0) {
        return { items: [], total: 0 };
      }
      
      // Obtener todos los items de Redis
      const allItems: Item[] = [];
      for (const key of itemKeys) {
        const item = await this.cache.get<Item>(key);
        if (item) {
          allItems.push(item);
        }
      }
      
      // Filtrar items por query (si existe)
      let filteredItems = allItems;
      if (queryText) {
        filteredItems = allItems.filter(item => 
          item.title.toLowerCase().includes(queryText) ||
          item.id.toLowerCase().includes(queryText)
        );
      }
      
      this.logger.log(`Filtered to ${filteredItems.length} items matching "${queryText || 'all'}"`);
      
      // Aplicar paginación
      const total = filteredItems.length;
      const startIndex = queryObj.offset;
      const endIndex = startIndex + queryObj.limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);
      
      return {
        items: paginatedItems,
        total,
      };
    } catch (error) {
      this.logger.error(`Error searching in Redis: ${error}`);
      return { items: [], total: 0 };
    }
  }

  // Método público para cargar búsqueda desde API (usado solo por data seeder si es necesario)
  async loadSearchFromApi(searchQuery: SearchQuery): Promise<SearchResult> {
    const queryObj = searchQuery.toObject();
    const queryText = queryObj.query || 'all';
    const cacheKey = `search:${queryText}:${queryObj.page}:${queryObj.limit}`;
    
    try {
      this.logger.log(`Loading search from API for seeding: ${queryText}`);
      const url = `${this.baseUrl}/sites/MLA/search`;
      
      // Si query está vacío, buscar sin filtro (todos los items)
      const params: any = {
        offset: queryObj.offset,
        limit: queryObj.limit,
      };
      
      if (queryObj.query) {
        params.q = queryObj.query;
      }
      
      const response = await this.httpClient.get<MeliSearchResponse>(url, { params });

      const result: SearchResult = {
        items: response.results.map((item) => this.mapToItemEntity(item)),
        total: response.paging.total,
      };

      await this.cache.set(cacheKey, result, this.cacheTtl);
      
      return result;
    } catch (error) {
      this.logger.error(`Error loading search: ${error}`);
      return { items: [], total: 0 };
    }
  }

  private mapToItemEntity(data: MeliItemResponse): Item {
    return new Item(
      data.id,
      data.title,
      data.price,
      data.currency_id,
      data.available_quantity,
      data.condition,
      data.thumbnail,
      data.pictures.map((p) => p.url),
      new Seller(data.seller.id, data.seller.nickname, data.seller.permalink),
      data.attributes.map((a) => new ItemAttribute(a.id, a.name, a.value_name)),
      data.category_id,
      data.permalink,
    );
  }

  private mapToDescriptionEntity(itemId: string, data: MeliDescriptionResponse): ItemDescription {
    const snapshot = data.snapshot
      ? new ItemDescriptionSnapshot(data.snapshot.url, data.snapshot.width, data.snapshot.height)
      : undefined;

    return new ItemDescription(itemId, data.plain_text, snapshot);
  }
}
