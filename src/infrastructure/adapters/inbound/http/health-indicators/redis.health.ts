import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = 'health-check-test';
      const testValue = 'ok';
      
      await this.cacheManager.set(testKey, testValue, 5000);
      const value = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);

      if (value === testValue) {
        return this.getStatus(key, true, { message: 'Redis is responsive' });
      }

      throw new Error('Redis not responding correctly');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: errorMessage }),
      );
    }
  }
}
