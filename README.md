# MercadoLibre Item API - Hexagonal Architecture

API de backend desarrollada con NestJS implementando **Arquitectura Hexagonal (Ports & Adapters)** para obtener información detallada de productos de MercadoLibre.

## 🏗️ Arquitectura Hexagonal

Este proyecto implementa una arquitectura hexagonal completa con separación clara de responsabilidades:

```
src/
├── domain/                    # Capa de Dominio (Núcleo)
│   ├── entities/             # Entidades del dominio
│   ├── value-objects/        # Objetos de valor
│   ├── ports/                # Interfaces (Contratos)
│   │   ├── inbound/         # Puertos de entrada (Use Cases)
│   │   └── outbound/        # Puertos de salida (Repositories, HTTP, Cache)
│   └── exceptions/          # Excepciones del dominio
├── application/              # Capa de Aplicación
│   ├── use-cases/           # Implementación de casos de uso
│   └── dto/                 # Data Transfer Objects
├── infrastructure/           # Capa de Infraestructura
│   ├── adapters/
│   │   ├── inbound/        # Adaptadores de entrada (Controllers HTTP)
│   │   └── outbound/       # Adaptadores de salida (Repositories, HTTP Client, Cache)
│   └── modules/            # Módulos NestJS
└── shared/                  # Código compartido
    ├── config/             # Configuración
    ├── filters/            # Exception filters
    └── interceptors/       # Interceptors
```

### Principios de Arquitectura Hexagonal

1. **Independencia del dominio**: La lógica de negocio no depende de frameworks externos
2. **Inversión de dependencias**: Las capas externas dependen de las internas
3. **Puertos y Adaptadores**: Interfaces claras entre capas
4. **Testabilidad**: Fácil de testear mediante mocks de puertos

## 🚀 Características

### Arquitectura y Diseño
- **Hexagonal Architecture**: Separación completa entre dominio, aplicación e infraestructura
- **Ports & Adapters**: Interfaces claras para cada dependencia externa
- **Domain-Driven Design**: Entidades ricas y Value Objects
- **SOLID Principles**: Código mantenible y escalable
- **Dependency Injection**: IoC container de NestJS
- **Redis-First Architecture**: Datos precargados en Redis para máximo rendimiento

### Capa de Dominio
- **Entidades**: `Item`, `ItemDescription` con lógica de negocio y validaciones
- **Value Objects**: `Pagination`, `SearchQuery` con validaciones inmutables
- **Puertos Inbound**: Interfaces de casos de uso (`GetItemUseCase`, `GetItemDescriptionUseCase`, `SearchItemsUseCase`)
- **Puertos Outbound**: Interfaces para repositorios, HTTP, cache
- **Excepciones**: Excepciones específicas del dominio (`ItemNotFoundException`, `ItemDescriptionNotFoundException`, `InvalidSearchQueryException`)

### Capa de Aplicación
- **Use Cases**: Implementación de lógica de aplicación
  - `GetItemService`: Obtener detalle de producto
  - `GetItemDescriptionService`: Obtener descripción de producto
  - `SearchItemsService`: Búsqueda de productos con paginación
- **DTOs**: Transformación entre dominio y presentación
  - `ItemResponseDto`, `ItemDescriptionResponseDto`, `SearchResponseDto`

### Capa de Infraestructura
- **Adaptadores Inbound (HTTP)**:
  - `ItemsController`: Endpoints REST para items
  - `HealthController`: Health checks con @nestjs/terminus
  - `MetricsController`: Endpoint de métricas Prometheus
- **Adaptadores Outbound**:
  - `MeliItemRepository`: Implementación del repositorio (Redis-first)
  - `RedisCacheAdapter`: Implementación de cache con Redis
  - `AxiosHttpClientAdapter`: Cliente HTTP para APIs externas
- **Servicios**:
  - `DataSeederService`: Carga automática de datos desde JSON a Redis al iniciar
  - `MetricsService`: Sistema completo de métricas con prom-client

### Observabilidad y Monitoreo
- **Logging Estructurado**: Pino logger con formato JSON
  - Logs en desarrollo con pino-pretty (colorizado)
  - Logs en producción en formato JSON
  - Interceptor de logging para todas las requests
- **Métricas Completas**: Sistema de métricas con Prometheus
  - **Métricas HTTP**: requests totales, duración, requests en progreso
  - **Métricas de Negocio**: items recuperados, búsquedas realizadas
  - **Métricas de Cache**: cache hits/misses por operación
  - **Métricas de API Externa**: llamadas, errores, latencia a MercadoLibre API
  - **Métricas del Sistema**: CPU, memoria, event loop (default metrics)
- **Health Checks**: Endpoints de salud con @nestjs/terminus
  - Health check de Redis
  - Health check general de la aplicación
- **Grafana**: Dashboards preconfigurables para visualización
- **Interceptores**:
  - `MetricsInterceptor`: Captura automática de métricas HTTP
  - `LoggingInterceptor`: Logging estructurado de requests

### Escalabilidad y Performance
- **Redis-First Strategy**: Todos los datos precargados en Redis al iniciar
  - Sin llamadas a APIs externas en runtime (máxima velocidad)
  - Data seeding automático desde archivo JSON
  - TTL configurable para expiración de cache
- **Rate Limiting**: Throttling con @nestjs/throttler (configurable)
- **Paginación**: Implementada en búsquedas con Value Objects
- **Búsqueda Optimizada**: Búsqueda en memoria sobre datos en Redis
- **Validación**: Validación automática de DTOs con class-validator

## 📋 Requisitos

- Node.js >= 20
- Docker y Docker Compose
- Redis (incluido en docker-compose)

## 🛠️ Instalación

### Desarrollo Local

```bash
# Clonar el repositorio
cd item-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar Redis
docker-compose up -d redis

# Iniciar en modo desarrollo
npm run start:dev
```

### Con Docker

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down
```

## 🔧 Configuración

Variables de entorno principales (`.env`):

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# MercadoLibre API
MELI_API_BASE_URL=https://api.mercadolibre.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info
```

## 📚 API Endpoints

### Items

#### Obtener detalle de un producto
```http
GET /api/v1/items/:id
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/v1/items/MLA1100002000
```

**Respuesta:**
```json
{
  "id": "MLA1100002000",
  "title": "Producto ejemplo",
  "price": 1500.00,
  "currencyId": "ARS",
  "availableQuantity": 10,
  "condition": "new",
  "thumbnail": "https://...",
  "pictures": ["https://..."],
  "seller": {
    "id": 123456,
    "nickname": "VENDEDOR"
  },
  "attributes": [...]
}
```

#### Obtener descripción de un producto
```http
GET /api/v1/items/:id/description
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/v1/items/MLA1100002000/description
```

#### Buscar productos (con paginación)
```http
GET /api/v1/items/search?query=laptop&page=1&limit=10
```

**Nota**: El parámetro `query` es opcional. Si se omite, devuelve todos los items.

**Ejemplo:**
```bash
# Buscar productos
curl "http://localhost:3000/api/v1/items/search?query=laptop&page=1&limit=10"

# Obtener todos los productos
curl "http://localhost:3000/api/v1/items/search?page=1&limit=20"
```

**Respuesta:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### Health & Monitoring

#### Health Check
```http
GET /health
```

#### Métricas Prometheus
```http
GET /metrics
```

**Métricas disponibles:**
- `http_requests_total`: Total de requests HTTP
- `http_request_duration_seconds`: Duración de requests
- `http_requests_in_progress`: Requests en progreso
- `items_retrieved_total`: Items recuperados
- `item_searches_total`: Búsquedas realizadas
- `cache_hits_total` / `cache_misses_total`: Estadísticas de cache
- `external_api_calls_total`: Llamadas a APIs externas
- `external_api_duration_seconds`: Latencia de APIs externas
- Métricas por defecto de Node.js (CPU, memoria, etc.)

#### Prometheus (Scraping)
```
URL: http://localhost:9093
```

#### Grafana (Visualización)
```
URL: http://localhost:3002
Usuario: admin
Contraseña: admin
```

**Configuración:**
- Prometheus como datasource preconfigurado
- Dashboards disponibles en `./grafana/dashboards/`

### Documentación Swagger

Accede a la documentación interactiva en:
```
http://localhost:3000/api/docs
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## 🏗️ Arquitectura Hexagonal - Detalles

### Estrategia de Datos: Redis-First

Esta API implementa una estrategia **Redis-First** donde:

1. **Al iniciar la aplicación**: El `DataSeederService` carga automáticamente datos desde `items-seed.json` a Redis
2. **En runtime**: Todas las consultas se resuelven desde Redis (sin llamadas a APIs externas)
3. **Ventajas**:
   - ⚡ Respuestas ultra-rápidas (< 10ms)
   - 🛡️ Sin dependencia de APIs externas en runtime
   - 📊 Control total sobre los datos disponibles
   - 💰 Sin costos de API rate limiting

### Flujo de una Request

```
HTTP Request
    ↓
[Controller] (Inbound Adapter)
    ↓
[Use Case] (Application Layer) ← implements → [Use Case Port] (Domain)
    ↓
[Repository Port] (Domain) ← implements → [Repository] (Outbound Adapter)
    ↓
[Cache Port] (Domain) ← implements → [Redis Adapter] (Outbound Adapter)
    ↓
Redis (Datos precargados)
```

**Nota**: El repositorio incluye métodos `loadItemFromApi()` y `loadDescriptionFromApi()` que pueden ser usados por el seeder o scripts externos para cargar datos desde MercadoLibre API, pero NO se usan en las requests normales.

### Ventajas de esta Arquitectura

1. **Testabilidad**: Fácil mockear puertos para testing
2. **Mantenibilidad**: Cambios en infraestructura no afectan dominio
3. **Flexibilidad**: Fácil cambiar adaptadores (ej: Redis → Memcached)
4. **Claridad**: Separación clara de responsabilidades
5. **Escalabilidad**: Fácil agregar nuevos casos de uso

### Ejemplo de Dependency Injection

```typescript
// Puerto (Domain)
export interface ItemRepositoryPort {
  findById(id: string): Promise<Item | null>;
}

// Implementación (Infrastructure)
@Injectable()
export class MeliItemRepository implements ItemRepositoryPort {
  async findById(id: string): Promise<Item | null> {
    // Implementación
  }
}

// Uso en Use Case (Application)
@Injectable()
export class GetItemService implements GetItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
  ) {}
}
```

## 📊 Comparación con Arquitectura Tradicional

| Aspecto | Arquitectura Tradicional | Arquitectura Hexagonal |
|---------|-------------------------|------------------------|
| **Dependencias** | Dominio depende de infraestructura | Infraestructura depende de dominio |
| **Testing** | Difícil mockear dependencias | Fácil mockear puertos |
| **Cambios** | Cambios en DB afectan lógica | Cambios en adaptadores aislados |
| **Claridad** | Responsabilidades mezcladas | Separación clara por capas |
| **Reutilización** | Código acoplado | Dominio reutilizable |

## 🚀 Despliegue

### Build de Producción

```bash
# Build
npm run build

# Iniciar en producción
npm run start:prod
```

### Docker Production

```bash
# Build imagen
docker build -t item-api:latest .

# Run
docker run -p 3000:3000 --env-file .env item-api:latest
```

## 📝 Scripts Disponibles

```bash
npm run build          # Compilar proyecto
npm run start          # Iniciar aplicación
npm run start:dev      # Modo desarrollo con watch
npm run start:prod     # Modo producción
npm run lint           # Ejecutar ESLint
npm run format         # Formatear código con Prettier
npm run test           # Tests unitarios
npm run test:cov       # Tests con coverage
npm run test:e2e       # Tests end-to-end
```

## 🎯 Mejores Prácticas Implementadas

✅ **Arquitectura Hexagonal** (Ports & Adapters)  
✅ **Domain-Driven Design** (Entidades, Value Objects, Excepciones de dominio)  
✅ **SOLID Principles** (Dependency Inversion, Single Responsibility)  
✅ **TypeScript estricto** con path aliases (@domain, @application, @infrastructure)  
✅ **Validación de DTOs** con class-validator y class-transformer  
✅ **Logging estructurado** con Pino (JSON en producción, pretty en desarrollo)  
✅ **Métricas y observabilidad** con Prometheus + Grafana  
✅ **Caching estratégico** con Redis (Redis-First architecture)  
✅ **Rate limiting** con @nestjs/throttler  
✅ **Health checks** con @nestjs/terminus  
✅ **Documentación Swagger** interactiva  
✅ **Docker multi-stage builds** optimizados  
✅ **Tests unitarios** con Jest (entidades, use cases, controllers)  
✅ **Global Exception Filters** para manejo centralizado de errores  
✅ **Interceptores** para logging y métricas automáticas  
✅ **Data Seeding** automático al iniciar la aplicación  
✅ **Security** con Helmet y CORS configurables  
✅ **Git Hooks** con Husky y lint-staged para calidad de código  

## 📄 Licencia

MIT

## 👤 Autor

Backend Senior Developer

---

**Nota**: Este proyecto demuestra la implementación de Arquitectura Hexagonal con NestJS, separando claramente el dominio de la infraestructura y facilitando el testing y mantenimiento del código.
