# Arquitectura Hexagonal - Documentación Técnica

## 🎯 Introducción

Este documento describe la implementación completa de **Arquitectura Hexagonal** (también conocida como Ports & Adapters) en el proyecto Item API de MercadoLibre.

La API implementa una estrategia **Redis-First** donde todos los datos se precargan en Redis al iniciar la aplicación, permitiendo respuestas ultra-rápidas sin dependencia de APIs externas en runtime.

## 📐 Principios Fundamentales

### 1. Separación de Capas

La arquitectura hexagonal organiza el código en tres capas principales:

```
┌─────────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER                    │
│  ┌───────────────────────────────────────────┐  │
│  │      APPLICATION LAYER                    │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │      DOMAIN LAYER (Core)            │  │  │
│  │  │                                     │  │  │
│  │  │  - Entities                         │  │  │
│  │  │  - Value Objects                    │  │  │
│  │  │  - Domain Logic                     │  │  │
│  │  │  - Ports (Interfaces)               │  │  │
│  │  │                                     │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  - Use Cases                              │  │
│  │  - Application Services                   │  │
│  │  - DTOs                                   │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  - Controllers (Inbound Adapters)               │
│  - Repositories (Outbound Adapters)             │
│  - HTTP Clients (Outbound Adapters)             │
│  - Cache (Outbound Adapters)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Inversión de Dependencias

```
┌──────────────┐         ┌──────────────┐
│   Use Case   │────────>│  Port (I)    │
└──────────────┘         └──────────────┘
                                ▲
                                │ implements
                                │
                         ┌──────────────┐
                         │   Adapter    │
                         └──────────────┘
```

## 🏗️ Estructura del Proyecto

### Domain Layer (Núcleo)

**Ubicación**: `src/domain/`

#### Entities

**`item.entity.ts`**: Entidad principal del dominio
```typescript
export class Item {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly price: number,
    public readonly currencyId: string,
    public readonly availableQuantity: number,
    public readonly condition: string,
    public readonly thumbnail: string,
    public readonly pictures: string[],
    public readonly seller: Seller,
    public readonly attributes: ItemAttribute[],
    public readonly categoryId?: string,
    public readonly permalink?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Item ID is required');
    }
    if (!this.title || this.title.trim() === '') {
      throw new Error('Item title is required');
    }
    if (this.price < 0) {
      throw new Error('Item price cannot be negative');
    }
    if (this.availableQuantity < 0) {
      throw new Error('Available quantity cannot be negative');
    }
  }

  isNew(): boolean {
    return this.condition === 'new';
  }

  isAvailable(): boolean {
    return this.availableQuantity > 0;
  }

  getFormattedPrice(): string {
    return `${this.currencyId} ${this.price.toFixed(2)}`;
  }
}
```

**`item-description.entity.ts`**: Descripción del producto
```typescript
export class ItemDescription {
  constructor(
    public readonly itemId: string,
    public readonly plainText: string,
    public readonly snapshot?: ItemDescriptionSnapshot,
  ) {}
}
```

**Responsabilidades**:
- Contener lógica de negocio pura
- Validar invariantes del dominio en el constructor
- Métodos de comportamiento (isNew, isAvailable, getFormattedPrice)
- Sin dependencias de frameworks o infraestructura

#### Value Objects

**`pagination.vo.ts`**: Objeto de valor para paginación
```typescript
export class Pagination {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly total: number,
  ) {
    if (page < 1) throw new Error('Page must be >= 1');
    if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');
    if (total < 0) throw new Error('Total cannot be negative');
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }
}
```

**`search-query.vo.ts`**: Objeto de valor para búsquedas
```typescript
export class SearchQuery {
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    if (page < 1) throw new InvalidSearchQueryException('Page must be >= 1');
    if (limit < 1 || limit > 100) {
      throw new InvalidSearchQueryException('Limit must be between 1 and 100');
    }
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }

  toObject() {
    return { query: this.query, page: this.page, limit: this.limit, offset: this.offset };
  }
}
```

**Características**:
- Inmutables (readonly properties)
- Auto-validables (validación en constructor)
- Métodos calculados (offset, totalPages)
- Sin setters

#### Ports (Interfaces)

**Inbound Ports** (`ports/inbound/`): Definen casos de uso

```typescript
// get-item.use-case.ts
export interface GetItemUseCase {
  execute(id: string): Promise<Item>;
}
export const GET_ITEM_USE_CASE = Symbol('GET_ITEM_USE_CASE');

// get-item-description.use-case.ts
export interface GetItemDescriptionUseCase {
  execute(id: string): Promise<ItemDescription>;
}
export const GET_ITEM_DESCRIPTION_USE_CASE = Symbol('GET_ITEM_DESCRIPTION_USE_CASE');

// search-items.use-case.ts
export interface SearchItemsUseCase {
  execute(query: string, page: number, limit: number): Promise<SearchResult>;
}
export const SEARCH_ITEMS_USE_CASE = Symbol('SEARCH_ITEMS_USE_CASE');
```

**Outbound Ports** (`ports/outbound/`): Definen dependencias externas

```typescript
// item.repository.port.ts
export interface ItemRepositoryPort {
  findById(id: string): Promise<Item | null>;
  findDescription(id: string): Promise<ItemDescription | null>;
  search(searchQuery: SearchQuery): Promise<SearchResult>;
}
export const ITEM_REPOSITORY_PORT = Symbol('ITEM_REPOSITORY_PORT');

// http-client.port.ts
export interface HttpClientPort {
  get<T>(url: string, config?: any): Promise<T>;
}
export const HTTP_CLIENT_PORT = Symbol('HTTP_CLIENT_PORT');

// cache.port.ts
export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  del(key: string): Promise<void>;
}
export const CACHE_PORT = Symbol('CACHE_PORT');
```

**Propósito**: Definir contratos sin implementación, permitiendo Dependency Inversion

### Application Layer

**Ubicación**: `src/application/`

#### Use Cases
Implementan los puertos inbound definidos en el dominio:

**`get-item.service.ts`**:
```typescript
@Injectable()
export class GetItemService implements GetItemUseCase {
  private readonly logger = new Logger(GetItemService.name);

  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(id: string): Promise<Item> {
    this.logger.log(`Getting item: ${id}`);
    const item = await this.itemRepository.findById(id);
    
    if (!item) {
      this.metricsService.incrementItemsRetrieved('not_found');
      throw new ItemNotFoundException(id);
    }
    
    this.metricsService.incrementItemsRetrieved('success');
    return item;
  }
}
```

**`search-items.service.ts`**:
```typescript
@Injectable()
export class SearchItemsService implements SearchItemsUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(query: string, page: number = 1, limit: number = 10) {
    const searchQuery = new SearchQuery(query, page, limit);
    const result = await this.itemRepository.search(searchQuery);
    
    this.metricsService.incrementItemSearches('success');
    
    const pagination = new Pagination(page, limit, result.total);
    return { items: result.items, pagination };
  }
}
```

**Características**:
- Orquestan la lógica de aplicación
- Inyectan dependencias mediante puertos
- Registran métricas de negocio
- Lanzan excepciones de dominio

#### DTOs
Transforman datos entre capas (dominio ↔ presentación):

**`item-response.dto.ts`**:
```typescript
export class ItemResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  title: string;
  
  @ApiProperty()
  price: number;
  
  // ... más propiedades

  static fromDomain(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.title = item.title;
    dto.price = item.price;
    // ... mapear todas las propiedades
    return dto;
  }
}
```

**`search-response.dto.ts`**:
```typescript
export class SearchResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  items: ItemResponseDto[];

  @ApiProperty()
  pagination: PaginationDto;

  static fromDomain(items: Item[], pagination: Pagination): SearchResponseDto {
    return {
      items: items.map(item => ItemResponseDto.fromDomain(item)),
      pagination: PaginationDto.fromDomain(pagination),
    };
  }
}
```

**Propósito**:
- Decorados con @ApiProperty para Swagger
- Método estático `fromDomain()` para transformación
- Validación con class-validator en DTOs de entrada

### Infrastructure Layer

**Ubicación**: `src/infrastructure/`

#### Inbound Adapters (Controllers)

**Ubicación**: `adapters/inbound/http/`

```typescript
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(GET_ITEM_USE_CASE)
    private readonly getItemUseCase: GetItemUseCase,
  ) {}

  @Get(':id')
  async getItem(@Param('id') id: string): Promise<ItemResponseDto> {
    const item = await this.getItemUseCase.execute(id);
    return ItemResponseDto.fromDomain(item);
  }
}
```

#### Outbound Adapters

**Repository Adapter** (`adapters/outbound/meli-item.repository.ts`):

Implementa estrategia **Redis-First**:

```typescript
@Injectable()
export class MeliItemRepository implements ItemRepositoryPort {
  constructor(
    @Inject(HTTP_CLIENT_PORT) private readonly httpClient: HttpClientPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  // Método principal: SOLO consulta Redis
  async findById(id: string): Promise<Item | null> {
    const cacheKey = `item:${id}`;
    const cached = await this.cache.get<Item>(cacheKey);
    
    if (cached) {
      this.metricsService.incrementCacheHits('item');
      return cached;
    }
    
    this.metricsService.incrementCacheMisses('item');
    return null; // NO llama a API externa
  }

  // Método auxiliar: Carga desde API (solo para seeding)
  async loadItemFromApi(id: string): Promise<Item | null> {
    const url = `${this.baseUrl}/items/${id}`;
    const response = await this.httpClient.get<MeliItemResponse>(url);
    const item = this.mapToItemEntity(response);
    await this.cache.set(`item:${id}`, item, this.cacheTtl);
    return item;
  }

  // Búsqueda: Filtra items en Redis
  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    const itemKeys = await this.cache.keys('item:*');
    const allItems: Item[] = [];
    
    for (const key of itemKeys) {
      const item = await this.cache.get<Item>(key);
      if (item) allItems.push(item);
    }
    
    // Filtrar por query
    const filteredItems = allItems.filter(item => 
      item.title.toLowerCase().includes(queryText) ||
      item.id.toLowerCase().includes(queryText)
    );
    
    // Aplicar paginación
    const paginatedItems = filteredItems.slice(offset, offset + limit);
    return { items: paginatedItems, total: filteredItems.length };
  }
}
```

**HTTP Client Adapter** (`adapters/outbound/axios-http-client.adapter.ts`):
```typescript
@Injectable()
export class AxiosHttpClientAdapter implements HttpClientPort {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(url, config)
    );
    return response.data;
  }
}
```

**Cache Adapter** (`adapters/outbound/redis-cache.adapter.ts`):
```typescript
@Injectable()
export class RedisCacheAdapter implements CachePort {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async keys(pattern: string): Promise<string[]> {
    const store = this.cacheManager.store as any;
    return await store.keys(pattern);
  }
}
```

## 🔄 Flujo de Datos

### Request Flow (Runtime)

```
1. HTTP Request (GET /api/v1/items/MLA123)
   ↓
2. MetricsInterceptor (captura inicio de request)
   ↓
3. ItemsController (Inbound Adapter)
   ↓
4. GetItemService (Use Case - Application Layer)
   ↓
5. ItemRepositoryPort (Domain Interface)
   ↓
6. MeliItemRepository (Outbound Adapter)
   ↓
7. CachePort (Domain Interface)
   ↓
8. RedisCacheAdapter (Outbound Adapter)
   ↓
9. Redis (Datos precargados)
   ↓
10. Response transformada con ItemResponseDto
   ↓
11. MetricsInterceptor (captura fin de request)
```

### Data Seeding Flow (Startup)

```
1. Application Bootstrap
   ↓
2. DataSeederService.onModuleInit()
   ↓
3. Leer items-seed.json
   ↓
4. Para cada item:
   - Crear entidad Item (validación de dominio)
   - Guardar en Redis via CachePort
   ↓
5. Aplicación lista para recibir requests
```

### Dependency Flow

```
Infrastructure → Application → Domain

Controllers ──→ Use Cases ──→ Entities
    ↓              ↓            ↑
Adapters ──→ Ports (I) ────────┘
```

## 🎨 Patrones de Diseño Implementados

### 1. Dependency Injection (IoC)

```typescript
// 1. Definir símbolo en el puerto (Domain)
export const ITEM_REPOSITORY_PORT = Symbol('ITEM_REPOSITORY_PORT');

// 2. Registrar implementación en módulo (Infrastructure)
@Module({
  providers: [
    {
      provide: ITEM_REPOSITORY_PORT,
      useClass: MeliItemRepository, // Implementación concreta
    },
    {
      provide: GET_ITEM_USE_CASE,
      useClass: GetItemService,
    },
  ],
})
export class ItemsModule {}

// 3. Inyectar en use case (Application)
constructor(
  @Inject(ITEM_REPOSITORY_PORT)
  private readonly itemRepository: ItemRepositoryPort, // Tipo del puerto
) {}
```

**Ventaja**: Fácil cambiar implementación sin modificar use cases

### 2. Repository Pattern

Abstrae el acceso a datos mediante interfaces:

```typescript
// Puerto (Domain)
export interface ItemRepositoryPort {
  findById(id: string): Promise<Item | null>;
  search(query: SearchQuery): Promise<SearchResult>;
}

// Adaptador (Infrastructure)
export class MeliItemRepository implements ItemRepositoryPort {
  // Implementación específica
}
```

### 3. Strategy Pattern

Permite intercambiar implementaciones:

```typescript
// Se puede cambiar fácilmente de Axios a Fetch
{
  provide: HTTP_CLIENT_PORT,
  useClass: AxiosHttpClientAdapter, // o FetchHttpClientAdapter
}

// O cambiar de Redis a Memcached
{
  provide: CACHE_PORT,
  useClass: RedisCacheAdapter, // o MemcachedAdapter
}
```

### 4. Data Seeding Pattern

**Implementación**:
```typescript
@Injectable()
export class DataSeederService implements OnModuleInit {
  async onModuleInit() {
    // Verificar si ya hay datos
    const existingItem = await this.cache.get('item:MLA123');
    if (existingItem) return; // Skip seeding
    
    // Cargar desde JSON
    const itemsData = require('../data/items-seed.json');
    
    // Crear entidades y guardar en Redis
    for (const itemData of itemsData) {
      const item = new Item(/* ... */);
      await this.cache.set(`item:${item.id}`, item, ttl);
    }
  }
}
```

### 5. Interceptor Pattern

**MetricsInterceptor**: Captura automática de métricas
```typescript
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const startTime = Date.now();
    this.metricsService.incrementHttpRequestsInProgress(method, route);
    
    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.observeHttpRequestDuration(method, route, statusCode, duration);
      })
    );
  }
}
```

### 6. Exception Filter Pattern

**DomainExceptionFilter**: Manejo centralizado de excepciones
```typescript
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    
    if (exception instanceof ItemNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    }
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
```

## ✅ Ventajas de esta Arquitectura

### 1. Testabilidad

```typescript
// Test del Use Case
const mockRepository: ItemRepositoryPort = {
  findById: jest.fn().mockResolvedValue(mockItem),
};

const service = new GetItemService(mockRepository);
```

### 2. Mantenibilidad

Cambiar de Redis a Memcached solo requiere crear un nuevo adaptador:

```typescript
export class MemcachedAdapter implements CachePort {
  // Nueva implementación
}
```

### 3. Independencia de Frameworks

El dominio no conoce NestJS, Express, o cualquier framework:

```typescript
// Dominio puro
export class Item {
  // Sin decoradores de NestJS
  // Sin dependencias externas
}
```

### 4. Flexibilidad

Fácil agregar nuevos adaptadores sin modificar el core:

```typescript
// Nuevo adaptador para GraphQL
export class ItemsGraphQLResolver {
  constructor(
    @Inject(GET_ITEM_USE_CASE)
    private readonly getItemUseCase: GetItemUseCase,
  ) {}
}
```

## 🧪 Testing Strategy

### Unit Tests - Domain Layer

```typescript
describe('Item Entity', () => {
  it('should validate price is not negative', () => {
    expect(() => new Item('1', 'Test', -100, ...))
      .toThrow('Price cannot be negative');
  });
});
```

### Unit Tests - Application Layer

```typescript
describe('GetItemService', () => {
  it('should return item when found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(mockItem) };
    const service = new GetItemService(mockRepo);
    
    const result = await service.execute('123');
    
    expect(result).toEqual(mockItem);
  });
});
```

### Integration Tests - Infrastructure Layer

```typescript
describe('MeliItemRepository', () => {
  it('should fetch item from API', async () => {
    // Test con API real o mock server
  });
});
```

## 🏗️ Módulos y Organización

### ItemsModule
```typescript
@Module({
  imports: [HttpModule, MetricsModule],
  controllers: [ItemsController],
  providers: [
    // Use Cases
    { provide: GET_ITEM_USE_CASE, useClass: GetItemService },
    { provide: GET_ITEM_DESCRIPTION_USE_CASE, useClass: GetItemDescriptionService },
    { provide: SEARCH_ITEMS_USE_CASE, useClass: SearchItemsService },
    // Adapters
    { provide: ITEM_REPOSITORY_PORT, useClass: MeliItemRepository },
    { provide: HTTP_CLIENT_PORT, useClass: AxiosHttpClientAdapter },
    { provide: CACHE_PORT, useClass: RedisCacheAdapter },
    // Services
    DataSeederService,
  ],
})
export class ItemsModule {}
```

### MetricsModule
```typescript
@Module({
  providers: [MetricsService],
  exports: [MetricsService], // Exportado para uso en otros módulos
})
export class MetricsModule {}
```

### HealthModule
```typescript
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
```

## 📊 Comparación con Layered Architecture

| Aspecto | Layered | Hexagonal (Este Proyecto) |
|---------|---------|---------------------------|
| **Dependencias** | Top → Down | Outside → Inside |
| **Dominio** | Conoce infraestructura | Independiente (sin imports de NestJS) |
| **Testing** | Difícil mockear | Fácil con puertos (ver tests) |
| **Flexibilidad** | Acoplado a frameworks | Desacoplado (cambiar Redis por otro cache) |
| **Complejidad** | Menor (menos archivos) | Mayor (más archivos, más interfaces) |
| **Mantenibilidad** | Baja a largo plazo | Alta (cambios aislados) |
| **Escalabilidad** | Limitada | Excelente (agregar adapters fácilmente) |

## 🔍 Características Especiales de esta Implementación

### 1. Redis-First Strategy
- **Sin llamadas a APIs externas en runtime**: Máxima velocidad y confiabilidad
- **Data seeding automático**: Carga datos desde JSON al iniciar
- **Búsqueda en memoria**: Filtrado y paginación sobre datos en Redis

### 2. Sistema de Métricas Completo
- **Métricas HTTP**: Automáticas via interceptor
- **Métricas de negocio**: Integradas en use cases
- **Métricas de cache**: Hit rate, misses por operación
- **Prometheus + Grafana**: Stack completo de observabilidad

### 3. Validación en Múltiples Capas
- **Dominio**: Validación en constructores de entidades y value objects
- **Aplicación**: Validación de lógica de negocio en use cases
- **Infraestructura**: Validación de DTOs con class-validator

### 4. Manejo de Errores Centralizado
- **Excepciones de dominio**: Específicas y tipadas
- **Global Exception Filter**: Convierte excepciones a respuestas HTTP
- **Logging estructurado**: Todos los errores registrados con contexto

### 5. Testing Facilitado
```typescript
// Test de Use Case (fácil mockear puertos)
const mockRepository: ItemRepositoryPort = {
  findById: jest.fn().mockResolvedValue(mockItem),
};
const service = new GetItemService(mockRepository, mockMetrics);

// Test de Entidad (sin dependencias)
const item = new Item('123', 'Test', 100, /* ... */);
expect(item.isAvailable()).toBe(true);
```

## 📈 Métricas de Calidad del Código

- **Cobertura de tests**: Tests unitarios en entidades, use cases y controllers
- **TypeScript estricto**: Sin `any`, tipos completos
- **Path aliases**: Imports limpios (@domain, @application, @infrastructure)
- **Linting**: ESLint + Prettier configurados
- **Git hooks**: Husky + lint-staged para validación pre-commit
- **Documentación**: Swagger automático con decoradores

## 🎓 Conclusión

La Arquitectura Hexagonal en este proyecto proporciona:

- ✅ **Separación clara** de responsabilidades (3 capas bien definidas)
- ✅ **Independencia** del dominio (sin dependencias de frameworks)
- ✅ **Testabilidad** mejorada (fácil mockear puertos)
- ✅ **Flexibilidad** para cambios (cambiar adaptadores sin tocar dominio)
- ✅ **Mantenibilidad** a largo plazo (código organizado y escalable)
- ✅ **Observabilidad** completa (métricas, logs, health checks)
- ✅ **Performance** óptimo (Redis-First strategy)

**Trade-off**: Mayor número de archivos y abstracciones (12 archivos en domain, 9 en application, 12 en infrastructure), pero con beneficios significativos en proyectos grandes y de larga duración.

**Casos de uso ideales**:
- APIs que requieren alta disponibilidad y performance
- Proyectos con múltiples desarrolladores
- Sistemas que evolucionarán a largo plazo
- Aplicaciones que necesitan cambiar proveedores externos fácilmente
