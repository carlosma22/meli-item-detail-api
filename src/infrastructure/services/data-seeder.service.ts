import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ItemRepositoryPort,
  ITEM_REPOSITORY_PORT,
} from '@domain/ports/outbound/item.repository.port';
import { CachePort, CACHE_PORT } from '@domain/ports/outbound/cache.port';
import { Item, Seller, ItemAttribute } from '@domain/entities/item.entity';
import { ItemDescription } from '@domain/entities/item-description.entity';
import * as itemsSeedData from '../data/items-seed.json';

@Injectable()
export class DataSeederService implements OnModuleInit {
  private readonly logger = new Logger(DataSeederService.name);
  private readonly itemsData: any[] = Array.isArray(itemsSeedData)
    ? itemsSeedData
    : (itemsSeedData as any).default || [];
  private readonly cacheTtl: number;

  constructor(
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get<number>('redis.ttl', 3600);
  }

  async onModuleInit() {
    this.logger.log('=== DATA SEEDER INITIALIZED ===');

    // Validar que los datos se cargaron correctamente
    if (!this.itemsData || this.itemsData.length === 0) {
      this.logger.error('❌ ERROR: No items data loaded from JSON file!');
      this.logger.error(`itemsData type: ${typeof this.itemsData}`);
      this.logger.error(`itemsData value: ${JSON.stringify(this.itemsData).substring(0, 200)}`);
      return;
    }

    this.logger.log(`✓ Loaded ${this.itemsData.length} items from JSON`);
    this.logger.log(`First item ID: ${this.itemsData[0]?.id}`);

    try {
      // Verificar si al menos un item ya existe en Redis
      const firstItemKey = `item:${this.itemsData[0].id}`;
      this.logger.log(`Checking if item exists in Redis: ${firstItemKey}`);

      const existingItem = await this.cache.get(firstItemKey);
      if (existingItem) {
        this.logger.log('✓ Items already seeded in Redis. Skipping seed process.');
        return;
      }

      this.logger.log('No items found in Redis. Starting seed process...');
      await this.seedItems();
      this.logger.log('=== DATA SEEDING PROCESS COMPLETED ===');
    } catch (error) {
      this.logger.error(`CRITICAL ERROR in data seeding: ${error}`);
      this.logger.error(error.stack);
    }
  }

  private async seedItems() {
    this.logger.log('>>> Starting items seeding from local JSON...');
    let itemsCreated = 0;
    let descriptionsCreated = 0;
    let itemsFailed = 0;

    this.logger.log(`Processing ${this.itemsData.length} items...`);

    for (let i = 0; i < this.itemsData.length; i++) {
      const itemData = this.itemsData[i];

      try {
        if (i % 50 === 0) {
          this.logger.log(`Progress: ${i}/${this.itemsData.length} items processed`);
        }

        // Log del primer item para debugging
        if (i === 0) {
          this.logger.log(`First item data: ${JSON.stringify(itemData).substring(0, 200)}`);
        }

        // Crear entidad de dominio desde los datos del JSON
        const seller = new Seller(
          itemData.seller.id,
          itemData.seller.nickname,
          itemData.seller.permalink,
        );

        const attributes = itemData.attributes.map(
          (attr: any) => new ItemAttribute(attr.id, attr.name, attr.valueName),
        );

        const item = new Item(
          itemData.id,
          itemData.title,
          itemData.price,
          itemData.currencyId,
          itemData.availableQuantity,
          itemData.condition,
          itemData.thumbnail,
          itemData.pictures,
          seller,
          attributes,
          itemData.categoryId,
          itemData.permalink,
        );

        // Guardar item en Redis
        const itemCacheKey = `item:${itemData.id}`;
        this.logger.debug(`Saving to Redis: ${itemCacheKey}`);
        await this.cache.set(itemCacheKey, item, this.cacheTtl);
        itemsCreated++;

        if (i === 0) {
          this.logger.log(`✓ First item saved successfully to Redis`);
          // Verificar que se guardó
          const verify = await this.cache.get(itemCacheKey);
          this.logger.log(
            `Verification: ${verify ? 'Item found in Redis' : 'Item NOT found in Redis'}`,
          );
        }

        // Guardar descripción en Redis si existe
        if (itemData.description) {
          const description = new ItemDescription(itemData.id, itemData.description, undefined);

          const descriptionCacheKey = `description:${itemData.id}`;
          await this.cache.set(descriptionCacheKey, description, this.cacheTtl);
          descriptionsCreated++;
        }
      } catch (error) {
        itemsFailed++;
        this.logger.error(`Error seeding item ${itemData?.id || 'unknown'}: ${error}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
    }

    this.logger.log('>>> Items seeding completed!');
    this.logger.log(`📊 SUMMARY:`);
    this.logger.log(`   Items created: ${itemsCreated}`);
    this.logger.log(`   Items failed: ${itemsFailed}`);
    this.logger.log(`   Descriptions created: ${descriptionsCreated}`);

    if (itemsCreated > 0) {
      this.logger.log(`   ✅ ${itemsCreated} items successfully loaded into Redis`);
    } else {
      this.logger.error(`   ❌ NO ITEMS WERE CREATED! Check errors above.`);
    }
  }
}
