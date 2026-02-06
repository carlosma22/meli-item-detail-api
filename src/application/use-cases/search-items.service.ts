import { Inject, Injectable, Logger } from '@nestjs/common';
import { SearchItemsUseCase, SearchItemsResult } from '@domain/ports/inbound/search-items.use-case';
import {
  ItemRepositoryPort,
  ITEM_REPOSITORY_PORT,
} from '@domain/ports/outbound/item.repository.port';
import { SearchQuery } from '@domain/value-objects/search-query.vo';
import { Pagination } from '@domain/value-objects/pagination.vo';
import { InvalidSearchQueryException } from '@domain/exceptions/domain.exception';
import { MetricsService } from '@/shared/services/metrics.service';

/**
 * Servicio de aplicación que implementa el caso de uso "Buscar Items".
 * 
 * Permite buscar productos con filtrado por query y paginación.
 * Si el query está vacío, retorna todos los items disponibles.
 * 
 * La búsqueda se realiza en memoria sobre los datos precargados en Redis,
 * garantizando respuestas ultra-rápidas (< 10ms).
 */
@Injectable()
export class SearchItemsService implements SearchItemsUseCase {
  private readonly logger = new Logger(SearchItemsService.name);

  /**
   * Constructor con inyección de dependencias.
   * 
   * @param itemRepository - Puerto del repositorio de items
   * @param metricsService - Servicio para registrar métricas de búsqueda
   */
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Ejecuta el caso de uso de búsqueda de items.
   * 
   * Flujo:
   * 1. Crea un Value Object SearchQuery (valida parámetros)
   * 2. Consulta el repositorio (filtra en memoria sobre Redis)
   * 3. Crea un Value Object Pagination con los resultados
   * 4. Registra métricas de búsqueda
   * 5. Retorna items + información de paginación
   * 
   * @param query - Término de búsqueda (vacío = todos los items)
   * @param page - Número de página (>= 1)
   * @param limit - Items por página (1-100)
   * @returns Objeto con array de items y objeto pagination
   * @throws InvalidSearchQueryException si los parámetros son inválidos
   */
  async execute(query: string, page: number, limit: number): Promise<SearchItemsResult> {
    this.logger.log(`Searching items: query="${query}", page=${page}, limit=${limit}`);

    try {
      // Crear Value Object con validación automática
      const searchQuery = new SearchQuery(query, page, limit);
      const result = await this.itemRepository.search(searchQuery);

      // Crear Value Object de paginación
      const pagination = new Pagination(page, limit, result.total);

      this.logger.log(`Found ${result.items.length} items out of ${result.total} total`);
      this.metricsService.incrementItemSearches('success');

      return {
        items: result.items,
        pagination,
      };
    } catch (error) {
      this.metricsService.incrementItemSearches('error');
      if (error instanceof Error) {
        this.logger.error(`Search failed: ${error.message}`);
        throw new InvalidSearchQueryException(error.message);
      }
      throw error;
    }
  }
}
