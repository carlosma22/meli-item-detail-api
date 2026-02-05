import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsInProgress: Gauge;
  private readonly itemsRetrievedTotal: Counter;
  private readonly itemSearchesTotal: Counter;
  private readonly cacheHitsTotal: Counter;
  private readonly cacheMissesTotal: Counter;
  private readonly externalApiCallsTotal: Counter;
  private readonly externalApiErrorsTotal: Counter;
  private readonly externalApiDuration: Histogram;

  constructor() {
    collectDefaultMetrics({ register });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [register],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method', 'route'],
      registers: [register],
    });

    this.itemsRetrievedTotal = new Counter({
      name: 'items_retrieved_total',
      help: 'Total number of items retrieved',
      labelNames: ['status'],
      registers: [register],
    });

    this.itemSearchesTotal = new Counter({
      name: 'item_searches_total',
      help: 'Total number of item searches performed',
      labelNames: ['status'],
      registers: [register],
    });

    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['operation'],
      registers: [register],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['operation'],
      registers: [register],
    });

    this.externalApiCallsTotal = new Counter({
      name: 'external_api_calls_total',
      help: 'Total number of external API calls',
      labelNames: ['api', 'endpoint', 'status'],
      registers: [register],
    });

    this.externalApiErrorsTotal = new Counter({
      name: 'external_api_errors_total',
      help: 'Total number of external API errors',
      labelNames: ['api', 'endpoint', 'error_type'],
      registers: [register],
    });

    this.externalApiDuration = new Histogram({
      name: 'external_api_duration_seconds',
      help: 'Duration of external API calls in seconds',
      labelNames: ['api', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [register],
    });
  }

  onModuleInit() {
    // Las métricas ya están registradas en el constructor
    // No hacer clear() para no borrarlas
  }

  incrementHttpRequests(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    durationInSeconds: number,
  ): void {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, durationInSeconds);
  }

  incrementHttpRequestsInProgress(method: string, route: string): void {
    this.httpRequestsInProgress.inc({ method, route });
  }

  decrementHttpRequestsInProgress(method: string, route: string): void {
    this.httpRequestsInProgress.dec({ method, route });
  }

  incrementItemsRetrieved(status: 'success' | 'not_found' | 'error'): void {
    this.itemsRetrievedTotal.inc({ status });
  }

  incrementItemSearches(status: 'success' | 'error'): void {
    this.itemSearchesTotal.inc({ status });
  }

  incrementCacheHits(operation: string): void {
    this.cacheHitsTotal.inc({ operation });
  }

  incrementCacheMisses(operation: string): void {
    this.cacheMissesTotal.inc({ operation });
  }

  incrementExternalApiCalls(api: string, endpoint: string, status: 'success' | 'error'): void {
    this.externalApiCallsTotal.inc({ api, endpoint, status });
  }

  incrementExternalApiErrors(api: string, endpoint: string, errorType: string): void {
    this.externalApiErrorsTotal.inc({ api, endpoint, error_type: errorType });
  }

  observeExternalApiDuration(api: string, endpoint: string, durationInSeconds: number): void {
    this.externalApiDuration.observe({ api, endpoint }, durationInSeconds);
  }

  getMetrics(): Promise<string> {
    return register.metrics();
  }

  getContentType(): string {
    return register.contentType;
  }
}
