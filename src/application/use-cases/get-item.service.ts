import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetItemUseCase } from '@domain/ports/inbound/get-item.use-case';
import { Item } from '@domain/entities/item.entity';
import {
  ItemRepositoryPort,
  ITEM_REPOSITORY_PORT,
} from '@domain/ports/outbound/item.repository.port';
import { ItemNotFoundException } from '@domain/exceptions/domain.exception';
import { MetricsService } from '@/shared/services/metrics.service';

/**
 * Servicio de aplicación que implementa el caso de uso "Obtener Item".
 * 
 * Este servicio orquesta la lógica de negocio para recuperar un producto
 * por su ID, incluyendo logging y captura de métricas.
 * 
 * Implementa el patrón de Dependency Inversion inyectando el puerto
 * del repositorio en lugar de la implementación concreta.
 */
@Injectable()
export class GetItemService implements GetItemUseCase {
  private readonly logger = new Logger(GetItemService.name);

  /**
   * Constructor con inyección de dependencias.
   * 
   * @param itemRepository - Puerto del repositorio de items (inyectado por símbolo)
   * @param metricsService - Servicio para registrar métricas de negocio
   */
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Ejecuta el caso de uso de obtener un item por ID.
   * 
   * Flujo:
   * 1. Consulta el repositorio (que lee desde Redis)
   * 2. Si no existe, lanza ItemNotFoundException
   * 3. Registra métricas de éxito/error
   * 4. Retorna la entidad de dominio Item
   * 
   * @param id - Identificador único del producto (ej: MLA123456789)
   * @returns Entidad Item con toda la información del producto
   * @throws ItemNotFoundException si el producto no existe en Redis
   */
  async execute(id: string): Promise<Item> {
    this.logger.log(`Fetching item with ID: ${id}`);

    try {
      const item = await this.itemRepository.findById(id);

      if (!item) {
        this.logger.warn(`Item not found: ${id}`);
        this.metricsService.incrementItemsRetrieved('not_found');
        throw new ItemNotFoundException(id);
      }

      this.logger.log(`Item found: ${id}`);
      this.metricsService.incrementItemsRetrieved('success');
      return item;
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw error;
      }
      this.metricsService.incrementItemsRetrieved('error');
      throw error;
    }
  }
}
