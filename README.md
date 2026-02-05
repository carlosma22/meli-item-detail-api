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

### Capa de Dominio
- **Entidades**: `Item`, `ItemDescription` con lógica de negocio
- **Value Objects**: `Pagination`, `SearchQuery` con validaciones
- **Puertos Inbound**: Interfaces de casos de uso
- **Puertos Outbound**: Interfaces para repositorios, HTTP, cache
- **Excepciones**: Excepciones específicas del dominio

### Capa de Aplicación
- **Use Cases**: Implementación de lógica de aplicación
- **DTOs**: Transformación entre dominio y presentación

### Capa de Infraestructura
- **Adaptadores HTTP**: Controllers REST
- **Adaptadores Repository**: Implementación con MercadoLibre API
- **Adaptadores Cache**: Implementación con Redis
- **Adaptadores HTTP Client**: Implementación con Axios

### Observabilidad
- **Logging Estructurado**: Pino logger con formato JSON
- **Métricas Completas**: Sistema de métricas con Prometheus
  - Métricas HTTP automáticas (requests, latencia, errores)
  - Métricas de negocio (items, búsquedas)
  - Métricas de cache (hit rate, misses)
  - Métricas de API externa (llamadas, latencia, errores)
  - Métricas del sistema (CPU, memoria, event loop)
- **Health Checks**: Endpoints de salud con @nestjs/terminus

### Escalabilidad
- **Caching**: Redis para caché distribuido
- **Rate Limiting**: Throttling con @nestjs/throttler
- **Paginación**: Implementada en búsquedas

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
curl http://localhost:3000/api/v1/items/MLA123456789
```

#### Obtener descripción de un producto
```http
GET /api/v1/items/:id/description
```

#### Buscar productos (con paginación)
```http
GET /api/v1/items/search/:query?page=1&limit=10
```

**Ejemplo:**
```bash
curl "http://localhost:3000/api/v1/items/search/laptop?page=1&limit=10"
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

**Documentación completa**: Ver [`METRICS.md`](./METRICS.md) para detalles de todas las métricas disponibles y queries PromQL.

#### Grafana (Visualización)
```
URL: http://localhost:3002
Usuario: admin
Contraseña: admin
```

**Dashboards incluidos:**
- Item API - Overview (métricas generales)
- Item API - Business Metrics (métricas de negocio)

**Documentación completa**: Ver [`GRAFANA.md`](./GRAFANA.md) para guía de uso y configuración.

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
[HTTP Client Port] (Domain) ← implements → [Axios Adapter] (Outbound Adapter)
    ↓
External API (MercadoLibre)
```

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

✅ Arquitectura Hexagonal (Ports & Adapters)  
✅ Domain-Driven Design  
✅ SOLID Principles  
✅ Dependency Inversion  
✅ TypeScript estricto  
✅ Validación de DTOs  
✅ Logging estructurado  
✅ Métricas y observabilidad  
✅ Caching con Redis  
✅ Rate limiting  
✅ Health checks  
✅ Documentación Swagger  
✅ Docker multi-stage builds  
✅ Tests unitarios  

## 📄 Licencia

MIT

## 👤 Autor

Backend Senior Developer

---

**Nota**: Este proyecto demuestra la implementación de Arquitectura Hexagonal con NestJS, separando claramente el dominio de la infraestructura y facilitando el testing y mantenimiento del código.
