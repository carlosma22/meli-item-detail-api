import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CachePort } from '@domain/ports/outbound/cache.port';

@Injectable()
export class RedisCacheAdapter implements CachePort {
  private readonly logger = new Logger(RedisCacheAdapter.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

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

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}: ${error}`);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache reset completed');
    } catch (error) {
      this.logger.error(`Cache reset error: ${error}`);
    }
  }

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
