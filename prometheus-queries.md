# Queries Prometheus - Ejemplos Prácticos

## 🎯 Queries Básicas

### Requests Totales
```promql
# Total de requests
sum(http_requests_total)

# Requests por método
sum by (method) (http_requests_total)

# Requests por endpoint
sum by (route) (http_requests_total)
```

### Tasa de Requests
```promql
# Requests por segundo (últimos 5 minutos)
rate(http_requests_total[5m])

# Requests por segundo por endpoint
sum by (route) (rate(http_requests_total[5m]))
```

---

## 📊 Performance y Latencia

### Latencia Promedio
```promql
# Latencia promedio por endpoint
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### Percentiles de Latencia
```promql
# P50 (mediana)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))

# P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# P95 por endpoint
histogram_quantile(0.95, sum by (route, le) (rate(http_request_duration_seconds_bucket[5m])))
```

### Endpoints más Lentos
```promql
# Top 5 endpoints más lentos (P95)
topk(5, histogram_quantile(0.95, sum by (route, le) (rate(http_request_duration_seconds_bucket[5m]))))
```

---

## ❌ Error Monitoring

### Error Rate
```promql
# Tasa de errores (status 4xx y 5xx)
sum(rate(http_requests_total{status_code=~"4..|5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Error rate por endpoint
sum by (route) (rate(http_requests_total{status_code=~"4..|5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))
```

### Errores 404
```promql
# Tasa de 404s
rate(http_requests_total{status_code="404"}[5m])

# Total de 404s en la última hora
increase(http_requests_total{status_code="404"}[1h])
```

### Errores 500
```promql
# Tasa de errores de servidor
rate(http_requests_total{status_code=~"5.."}[5m])

# Alertar si hay más de 5 errores 500 por minuto
rate(http_requests_total{status_code=~"5.."}[1m]) > 5
```

---

## 💾 Cache Performance

### Cache Hit Rate
```promql
# Hit rate global
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))

# Hit rate por operación
sum by (operation) (rate(cache_hits_total[5m])) / (sum by (operation) (rate(cache_hits_total[5m])) + sum by (operation) (rate(cache_misses_total[5m])))
```

### Cache Efficiency
```promql
# Hits vs Misses
sum(rate(cache_hits_total[5m]))
sum(rate(cache_misses_total[5m]))

# Ratio hits/misses
sum(rate(cache_hits_total[5m])) / sum(rate(cache_misses_total[5m]))
```

---

## 🛒 Métricas de Negocio

### Items Recuperados
```promql
# Tasa de items recuperados exitosamente
rate(items_retrieved_total{status="success"}[5m])

# Tasa de items no encontrados
rate(items_retrieved_total{status="not_found"}[5m])

# Ratio success/not_found
rate(items_retrieved_total{status="success"}[5m]) / rate(items_retrieved_total{status="not_found"}[5m])
```

### Búsquedas
```promql
# Búsquedas por segundo
rate(item_searches_total{status="success"}[5m])

# Tasa de éxito de búsquedas
rate(item_searches_total{status="success"}[5m]) / rate(item_searches_total[5m])
```

---

## 🌐 API Externa (MercadoLibre)

### Llamadas a API
```promql
# Llamadas por segundo
rate(external_api_calls_total{api="mercadolibre"}[5m])

# Llamadas por endpoint
sum by (endpoint) (rate(external_api_calls_total{api="mercadolibre"}[5m]))
```

### Latencia de API Externa
```promql
# Latencia promedio
rate(external_api_duration_seconds_sum{api="mercadolibre"}[5m]) / rate(external_api_duration_seconds_count{api="mercadolibre"}[5m])

# P95 por endpoint
histogram_quantile(0.95, sum by (endpoint, le) (rate(external_api_duration_seconds_bucket{api="mercadolibre"}[5m])))
```

### Error Rate de API Externa
```promql
# Tasa de errores
rate(external_api_errors_total{api="mercadolibre"}[5m])

# Error rate por tipo
sum by (error_type) (rate(external_api_errors_total{api="mercadolibre"}[5m]))

# Porcentaje de errores
sum(rate(external_api_calls_total{api="mercadolibre",status="error"}[5m])) / sum(rate(external_api_calls_total{api="mercadolibre"}[5m]))
```

---

## 🖥️ Sistema y Recursos

### CPU
```promql
# Uso de CPU
rate(process_cpu_user_seconds_total[5m])
rate(process_cpu_system_seconds_total[5m])

# CPU total
rate(process_cpu_user_seconds_total[5m]) + rate(process_cpu_system_seconds_total[5m])
```

### Memoria
```promql
# Memoria residente (en MB)
process_resident_memory_bytes / 1024 / 1024

# Heap size (en MB)
process_heap_bytes / 1024 / 1024
```

### Event Loop
```promql
# Lag del event loop
nodejs_eventloop_lag_seconds

# Alertar si el lag es mayor a 100ms
nodejs_eventloop_lag_seconds > 0.1
```

### Handles y Requests
```promql
# Handles activos
nodejs_active_handles_total

# Requests activos
nodejs_active_requests_total
```

---

## 🚨 Alertas Recomendadas

### Alta Latencia
```promql
# Alerta si P95 > 1 segundo
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
```

### Alto Error Rate
```promql
# Alerta si error rate > 5%
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
```

### Bajo Cache Hit Rate
```promql
# Alerta si hit rate < 80%
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m]))) < 0.8
```

### API Externa con Problemas
```promql
# Alerta si error rate de API > 10%
sum(rate(external_api_calls_total{api="mercadolibre",status="error"}[5m])) / sum(rate(external_api_calls_total{api="mercadolibre"}[5m])) > 0.1
```

### Alto Uso de Memoria
```promql
# Alerta si memoria > 500MB
process_resident_memory_bytes / 1024 / 1024 > 500
```

---

## 📈 Dashboards

### Dashboard Principal
```promql
# Panel 1: Requests por segundo
sum(rate(http_requests_total[5m]))

# Panel 2: Latencia P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Panel 3: Error Rate
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Panel 4: Cache Hit Rate
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

### Dashboard de Negocio
```promql
# Panel 1: Items recuperados/segundo
rate(items_retrieved_total{status="success"}[5m])

# Panel 2: Búsquedas/segundo
rate(item_searches_total{status="success"}[5m])

# Panel 3: Tasa de items no encontrados
rate(items_retrieved_total{status="not_found"}[5m])

# Panel 4: Success rate de búsquedas
rate(item_searches_total{status="success"}[5m]) / rate(item_searches_total[5m])
```

---

## 🔍 Debugging

### Identificar Endpoint Problemático
```promql
# Endpoint con más errores
topk(5, sum by (route) (rate(http_requests_total{status_code=~"5.."}[5m])))

# Endpoint más lento
topk(5, histogram_quantile(0.95, sum by (route, le) (rate(http_request_duration_seconds_bucket[5m]))))
```

### Correlación de Problemas
```promql
# Comparar latencia con error rate
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

---

## 💡 Tips

1. **Usar rangos apropiados**: `[5m]` para queries en tiempo real, `[1h]` para análisis histórico
2. **Agregar por labels**: Usar `sum by (label)` para agrupar métricas
3. **Rate vs Increase**: `rate()` para tasas por segundo, `increase()` para totales
4. **Percentiles**: Usar histogramas para calcular P50, P95, P99
5. **Alertas**: Configurar umbrales basados en SLOs del negocio

---

**Nota**: Todas estas queries están disponibles en Prometheus UI en `http://localhost:9093`
