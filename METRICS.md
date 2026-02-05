# Sistema de Métricas - Prometheus

## 📊 Descripción General

El proyecto implementa un sistema completo de métricas con **Prometheus** para monitoreo y observabilidad. Las métricas se recolectan automáticamente y están disponibles en el endpoint `/metrics`.

## 🎯 Tipos de Métricas Implementadas

### 1. **Métricas HTTP** (Automáticas)

#### `http_requests_total` (Counter)
Contador total de requests HTTP.

**Labels:**
- `method`: Método HTTP (GET, POST, etc.)
- `route`: Ruta del endpoint
- `status_code`: Código de respuesta HTTP

**Ejemplo:**
```
http_requests_total{method="GET",route="/api/v1/items/:id",status_code="200"} 150
http_requests_total{method="GET",route="/api/v1/items/:id",status_code="404"} 5
```

#### `http_request_duration_seconds` (Histogram)
Duración de las requests HTTP en segundos.

**Labels:**
- `method`: Método HTTP
- `route`: Ruta del endpoint
- `status_code`: Código de respuesta

**Buckets:** [0.01, 0.05, 0.1, 0.5, 1, 2, 5]

**Ejemplo:**
```
http_request_duration_seconds_bucket{method="GET",route="/api/v1/items/:id",status_code="200",le="0.1"} 120
http_request_duration_seconds_sum{method="GET",route="/api/v1/items/:id",status_code="200"} 8.5
http_request_duration_seconds_count{method="GET",route="/api/v1/items/:id",status_code="200"} 150
```

#### `http_requests_in_progress` (Gauge)
Número de requests HTTP actualmente en proceso.

**Labels:**
- `method`: Método HTTP
- `route`: Ruta del endpoint

**Ejemplo:**
```
http_requests_in_progress{method="GET",route="/api/v1/items/:id"} 3
```

---

### 2. **Métricas de Negocio**

#### `items_retrieved_total` (Counter)
Total de items recuperados.

**Labels:**
- `status`: Estado de la operación (`success`, `not_found`, `error`)

**Ejemplo:**
```
items_retrieved_total{status="success"} 1250
items_retrieved_total{status="not_found"} 45
items_retrieved_total{status="error"} 2
```

#### `item_searches_total` (Counter)
Total de búsquedas de items realizadas.

**Labels:**
- `status`: Estado de la búsqueda (`success`, `error`)

**Ejemplo:**
```
item_searches_total{status="success"} 850
item_searches_total{status="error"} 5
```

---

### 3. **Métricas de Cache**

#### `cache_hits_total` (Counter)
Total de aciertos en cache.

**Labels:**
- `operation`: Tipo de operación (`item`, `description`, `search`)

**Ejemplo:**
```
cache_hits_total{operation="item"} 2500
cache_hits_total{operation="description"} 1200
```

#### `cache_misses_total` (Counter)
Total de fallos en cache.

**Labels:**
- `operation`: Tipo de operación (`item`, `description`, `search`)

**Ejemplo:**
```
cache_misses_total{operation="item"} 150
cache_misses_total{operation="description"} 80
```

**Cálculo de Hit Rate:**
```
cache_hit_rate = cache_hits_total / (cache_hits_total + cache_misses_total)
```

---

### 4. **Métricas de API Externa**

#### `external_api_calls_total` (Counter)
Total de llamadas a APIs externas.

**Labels:**
- `api`: Nombre de la API (`mercadolibre`)
- `endpoint`: Endpoint llamado
- `status`: Estado (`success`, `error`)

**Ejemplo:**
```
external_api_calls_total{api="mercadolibre",endpoint="/items/:id",status="success"} 500
external_api_calls_total{api="mercadolibre",endpoint="/items/:id",status="error"} 10
```

#### `external_api_errors_total` (Counter)
Total de errores en llamadas a APIs externas.

**Labels:**
- `api`: Nombre de la API
- `endpoint`: Endpoint llamado
- `error_type`: Tipo de error (`not_found`, `timeout`, etc.)

**Ejemplo:**
```
external_api_errors_total{api="mercadolibre",endpoint="/items/:id",error_type="not_found"} 8
external_api_errors_total{api="mercadolibre",endpoint="/items/:id",error_type="timeout"} 2
```

#### `external_api_duration_seconds` (Histogram)
Duración de llamadas a APIs externas en segundos.

**Labels:**
- `api`: Nombre de la API
- `endpoint`: Endpoint llamado

**Buckets:** [0.1, 0.5, 1, 2, 5, 10]

**Ejemplo:**
```
external_api_duration_seconds_bucket{api="mercadolibre",endpoint="/items/:id",le="0.5"} 450
external_api_duration_seconds_sum{api="mercadolibre",endpoint="/items/:id"} 180.5
external_api_duration_seconds_count{api="mercadolibre",endpoint="/items/:id"} 500
```

---

### 5. **Métricas del Sistema** (Default)

Métricas estándar de Node.js recolectadas automáticamente:

- `process_cpu_user_seconds_total`: Tiempo de CPU en modo usuario
- `process_cpu_system_seconds_total`: Tiempo de CPU en modo sistema
- `process_resident_memory_bytes`: Memoria residente
- `process_heap_bytes`: Tamaño del heap
- `nodejs_eventloop_lag_seconds`: Lag del event loop
- `nodejs_active_handles_total`: Handles activos
- `nodejs_active_requests_total`: Requests activos

---

## 🚀 Acceso a las Métricas

### Endpoint

```
GET http://localhost:3000/metrics
```

### Formato de Respuesta

```
Content-Type: text/plain; version=0.0.4; charset=utf-8
```

### Ejemplo de Uso

```bash
curl http://localhost:3000/metrics
```

---

## 📈 Integración con Prometheus

### Configuración de Prometheus

El archivo `prometheus.yml` ya está configurado:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'item-api'
    static_configs:
      - targets: ['app:3000']
```

### Iniciar Prometheus

```bash
# Con Docker Compose
docker-compose up -d prometheus

# Acceder a Prometheus UI
http://localhost:9093
```

---

## 📊 Queries PromQL Útiles

### Tasa de Requests por Segundo
```promql
rate(http_requests_total[5m])
```

### Latencia P95
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Cache Hit Rate
```promql
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

### Error Rate de API Externa
```promql
rate(external_api_errors_total[5m]) / rate(external_api_calls_total[5m])
```

### Requests en Progreso
```promql
sum(http_requests_in_progress)
```

### Top 5 Endpoints más Lentos
```promql
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### Tasa de Items No Encontrados
```promql
rate(items_retrieved_total{status="not_found"}[5m])
```

---

## 🎯 Dashboards Recomendados

### 1. **Dashboard de Performance HTTP**
- Requests por segundo
- Latencia (P50, P95, P99)
- Error rate por endpoint
- Requests en progreso

### 2. **Dashboard de Negocio**
- Items recuperados (success/not_found/error)
- Búsquedas realizadas
- Tasa de éxito

### 3. **Dashboard de Cache**
- Hit rate por operación
- Hits vs Misses
- Tendencia de cache

### 4. **Dashboard de API Externa**
- Llamadas por segundo
- Latencia de MercadoLibre API
- Error rate
- Tipos de errores

---

## 🔧 Implementación Técnica

### Arquitectura

```
┌─────────────────┐
│   HTTP Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ MetricsInterceptor  │ ◄── Métricas HTTP automáticas
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Use Case      │ ◄── Métricas de negocio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ ◄── Métricas de cache y API
└─────────────────┘
```

### Componentes

1. **`MetricsService`**: Servicio centralizado para todas las métricas
2. **`MetricsInterceptor`**: Interceptor global para métricas HTTP automáticas
3. **Use Cases**: Métricas de negocio en cada caso de uso
4. **Repository**: Métricas de cache y API externa

---

## 📝 Mejores Prácticas

### ✅ DO
- Usar labels consistentes
- Mantener cardinalidad baja en labels
- Usar nombres descriptivos
- Documentar nuevas métricas
- Monitorear métricas críticas

### ❌ DON'T
- No usar IDs únicos en labels (alta cardinalidad)
- No crear métricas redundantes
- No olvidar incrementar contadores en paths de error
- No usar métricas para logging

---

## 🎓 Recursos

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

---

## 🔍 Troubleshooting

### Métricas no aparecen

1. Verificar que el endpoint `/metrics` responde:
   ```bash
   curl http://localhost:3000/metrics
   ```

2. Verificar configuración de Prometheus:
   ```bash
   docker-compose logs prometheus
   ```

3. Verificar targets en Prometheus UI:
   ```
   http://localhost:9093/targets
   ```

### Valores incorrectos

1. Verificar que los interceptors están registrados
2. Revisar logs de la aplicación
3. Verificar inyección de dependencias en módulos

---

**Última actualización:** 2026-02-05
