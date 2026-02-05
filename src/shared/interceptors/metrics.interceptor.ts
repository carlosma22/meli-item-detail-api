import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {
    console.log('[MetricsInterceptor] Constructor called, service:', !!this.metricsService);
  }

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

    this.metricsService.incrementHttpRequestsInProgress(method, route);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          this.metricsService.decrementHttpRequestsInProgress(method, route);
          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpRequestDuration(method, route, statusCode, duration);
        },
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

  private getRoute(request: any): string {
    if (request.route?.path) {
      return request.route.path;
    }
    return request.url.split('?')[0];
  }
}
