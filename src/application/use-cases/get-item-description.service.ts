import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetItemDescriptionUseCase } from '@domain/ports/inbound/get-item-description.use-case';
import { ItemDescription } from '@domain/entities/item-description.entity';
import {
  ItemRepositoryPort,
  ITEM_REPOSITORY_PORT,
} from '@domain/ports/outbound/item.repository.port';
import { ItemDescriptionNotFoundException } from '@domain/exceptions/domain.exception';

/**
 * Servicio de aplicación que implementa el caso de uso "Obtener Descripción de Item".
 * 
 * Recupera la descripción detallada de un producto desde Redis.
 * La descripción incluye texto plano y opcionalmente una imagen snapshot.
 */
@Injectable()
export class GetItemDescriptionService implements GetItemDescriptionUseCase {
  private readonly logger = new Logger(GetItemDescriptionService.name);

  /**
   * Constructor con inyección de dependencias.
   * 
   * @param itemRepository - Puerto del repositorio de items
   */
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
  ) {}

  /**
   * Ejecuta el caso de uso de obtener la descripción de un item.
   * 
   * @param id - Identificador del producto
   * @returns Entidad ItemDescription con el texto y snapshot (si existe)
   * @throws ItemDescriptionNotFoundException si la descripción no existe en Redis
   */
  async execute(id: string): Promise<ItemDescription> {
    this.logger.log(`Fetching description for item: ${id}`);

    const description = await this.itemRepository.findDescription(id);

    if (!description) {
      this.logger.warn(`Description not found for item: ${id}`);
      throw new ItemDescriptionNotFoundException(id);
    }

    this.logger.log(`Description found for item: ${id}`);
    return description;
  }
}
