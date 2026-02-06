import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

/**
 * Interceptor global que captura métricas HTTP automáticamente.
 * 
 * Este interceptor se ejecuta en cada request HTTP y registra:
 * - Número total de requests (counter)
 * - Duración de cada request (histogram)
 * - Requests en progreso (gauge)
 * 
 * Las métricas se exponen en el endpoint /metrics para Prometheus.
 * Implementa el patrón Observer para capturar eventos de requests.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  /**
   * Constructor con inyección del servicio de métricas.
   * 
   * @param metricsService - Servicio que gestiona las métricas de Prometheus
   */
  constructor(private readonly metricsService: MetricsService) {
    console.log('[MetricsInterceptor] Constructor called, service:', !!this.metricsService);
  }

  /**
   * Método que intercepta cada request HTTP.
   * 
   * Flujo:
   * 1. Captura método HTTP y ruta al inicio del request
   * 2. Incrementa contador de requests en progreso
   * 3. Inicia timer para medir duración
   * 4. Ejecuta el handler del request
   * 5. Al finalizar (éxito o error):
   *    - Decrementa requests en progreso
   *    - Incrementa contador total de requests
   *    - Registra duración en histogram
   * 
   * @param context - Contexto de ejecución de NestJS
   * @param next - Handler del siguiente interceptor/controlador
   * @returns Observable con la respuesta del request
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const route = this.getRoute(request);
    const startTime = Date.now();

    console.log('[MetricsInterceptor] Intercepting:', method, route);

    if (!this.metricsService) {
      console.error('[MetricsInterceptor] MetricsService is not available!');
      return next.handle();
    }

    // Incrementar gauge de requests en progreso
    this.metricsService.incrementHttpRequestsInProgress(method, route);

    return next.handle().pipe(
      tap({
        // Callback para requests exitosos
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          this.metricsService.decrementHttpRequestsInProgress(method, route);
          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpRequestDuration(method, route, statusCode, duration);
        },
        // Callback para requests con error
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          this.metricsService.decrementHttpRequestsInProgress(method, route);
          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpRequestDuration(method, route, statusCode, duration);
        },
      }),
    );
  }

  /**
   * Extrae la ruta del request para usar como label en métricas.
   * 
   * Intenta obtener la ruta parametrizada (ej: /items/:id) en lugar de
   * la URL completa (ej: /items/MLA123) para agrupar métricas correctamente.
   * 
   * @param request - Objeto request de Express
   * @returns Ruta parametrizada o URL sin query params
   */
  private getRoute(request: any): string {
    if (request.route?.path) {
      return request.route.path;
    }
    return request.url.split('?')[0];
  }
}
