import { Module } from '@nestjs/common';
import { MetricsController } from '../adapters/inbound/http/metrics.controller';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {}
