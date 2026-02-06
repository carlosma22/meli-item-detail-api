import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CachePort } from '@domain/ports/outbound/cache.port';

/**
 * Adaptador de salida (Outbound Adapter) que implementa el puerto de cache.
 * 
 * Proporciona una abstracción sobre Redis usando cache-manager.
 * Este adaptador permite cambiar la implementación de cache sin afectar
 * el dominio o la lógica de aplicación.
 * 
 * Implementa el patrón Adapter y Strategy de la arquitectura hexagonal.
 */
@Injectable()
export class RedisCacheAdapter implements CachePort {
  private readonly logger = new Logger(RedisCacheAdapter.name);

  /**
   * Constructor con inyección del cache manager de NestJS.
   * 
   * @param cacheManager - Instancia de cache-manager configurada con Redis
   */
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Obtiene un valor del cache por su clave.
   * 
   * @param key - Clave del valor en Redis (ej: 'item:MLA123')
   * @returns Valor deserializado o null si no existe o hay error
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit: ${key}`);
      } else {
        this.logger.debug(`Cache miss: ${key}`);
      }
      return value || null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}: ${error}`);
      return null;
    }
  }

  /**
   * Guarda un valor en el cache con TTL opcional.
   * 
   * @param key - Clave para almacenar el valor
   * @param value - Valor a almacenar (será serializado automáticamente)
   * @param ttl - Tiempo de vida en milisegundos (opcional, usa default si no se especifica)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}: ${error}`);
    }
  }

  /**
   * Elimina una clave del cache.
   * 
   * @param key - Clave a eliminar
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}: ${error}`);
    }
  }

  /**
   * Limpia todo el cache (elimina todas las claves).
   * Usar con precaución en producción.
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache reset completed');
    } catch (error) {
      this.logger.error(`Cache reset error: ${error}`);
    }
  }

  /**
   * Obtiene todas las claves que coinciden con un patrón.
   * 
   * Usado principalmente para búsquedas que necesitan escanear
   * todos los items en Redis.
   * 
   * @param pattern - Patrón de búsqueda (ej: 'item:*' para todos los items)
   * @returns Array de claves que coinciden con el patrón
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const store = this.cacheManager.store;
      if (store && typeof (store as any).keys === 'function') {
        const keys = await (store as any).keys(pattern);
        this.logger.debug(`Found ${keys.length} keys matching pattern: ${pattern}`);
        return keys;
      }
      this.logger.warn('Redis store does not support keys operation');
      return [];
    } catch (error) {
      this.logger.error(`Cache keys error for pattern ${pattern}: ${error}`);
      return [];
    }
  }
}
