import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { register } from 'prom-client';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    register.clear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    register.clear();
  });

  afterEach(() => {
    // Limpiar después de cada test
    register.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('incrementHttpRequests', () => {
    it('should increment HTTP request counter', () => {
      expect(() => {
        service.incrementHttpRequests('GET', '/api/v1/items', 200);
      }).not.toThrow();
    });
  });

  describe('observeHttpRequestDuration', () => {
    it('should observe HTTP request duration', () => {
      expect(() => {
        service.observeHttpRequestDuration('GET', '/api/v1/items', 200, 0.5);
      }).not.toThrow();
    });
  });

  describe('incrementItemsRetrieved', () => {
    it('should increment items retrieved counter', () => {
      expect(() => {
        service.incrementItemsRetrieved('success');
      }).not.toThrow();
    });
  });

  describe('incrementItemSearches', () => {
    it('should increment item searches counter', () => {
      expect(() => {
        service.incrementItemSearches('success');
      }).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return metrics in Prometheus format', async () => {
      const metrics = await service.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('# HELP');
      expect(metrics).toContain('# TYPE');
    });
  });
});
