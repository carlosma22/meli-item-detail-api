import { Module, Global } from '@nestjs/common';
import { MetricsController } from '../adapters/inbound/http/metrics.controller';
import { MetricsService } from '@/shared/services/metrics.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
