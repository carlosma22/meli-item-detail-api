# Arquitectura Hexagonal - Documentación Técnica

## 🎯 Introducción

Este documento describe la implementación de **Arquitectura Hexagonal** (también conocida como Ports & Adapters) en el proyecto Item API.

## 📐 Principios Fundamentales

### 1. Separación de Capas

La arquitectura hexagonal organiza el código en tres capas principales:

```
┌─────────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER                     │
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
│  │                                            │  │
│  │  - Use Cases                               │  │
│  │  - Application Services                    │  │
│  │  - DTOs                                    │  │
│  │                                            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  - Controllers (Inbound Adapters)                │
│  - Repositories (Outbound Adapters)              │
│  - HTTP Clients (Outbound Adapters)              │
│  - Cache (Outbound Adapters)                     │
│                                                  │
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
- `item.entity.ts`: Entidad principal con lógica de negocio
- `item-description.entity.ts`: Descripción del producto

**Responsabilidades**:
- Contener lógica de negocio
- Validar invariantes del dominio
- Métodos de comportamiento

**Ejemplo**:
```typescript
export class Item {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly price: number,
    // ...
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.price < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  isAvailable(): boolean {
    return this.availableQuantity > 0;
  }
}
```

#### Value Objects
- `pagination.vo.ts`: Objeto de valor para paginación
- `search-query.vo.ts`: Objeto de valor para búsquedas

**Características**:
- Inmutables
- Auto-validables
- Comparables por valor

#### Ports (Interfaces)

**Inbound Ports** (`ports/inbound/`):
- `get-item.use-case.ts`
- `get-item-description.use-case.ts`
- `search-items.use-case.ts`

**Outbound Ports** (`ports/outbound/`):
- `item.repository.port.ts`
- `http-client.port.ts`
- `cache.port.ts`

**Propósito**: Definir contratos sin implementación

### Application Layer

**Ubicación**: `src/application/`

#### Use Cases
Implementan los puertos inbound definidos en el dominio:

```typescript
@Injectable()
export class GetItemService implements GetItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: ItemRepositoryPort,
  ) {}

  async execute(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new ItemNotFoundException(id);
    }
    return item;
  }
}
```

#### DTOs
Transforman datos entre capas:
- `item-response.dto.ts`
- `item-description-response.dto.ts`
- `search-response.dto.ts`

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
```typescript
@Injectable()
export class MeliItemRepository implements ItemRepositoryPort {
  constructor(
    @Inject(HTTP_CLIENT_PORT) 
    private readonly httpClient: HttpClientPort,
    @Inject(CACHE_PORT) 
    private readonly cache: CachePort,
  ) {}

  async findById(id: string): Promise<Item | null> {
    // Implementación
  }
}
```

**HTTP Client Adapter** (`adapters/outbound/axios-http-client.adapter.ts`):
```typescript
@Injectable()
export class AxiosHttpClientAdapter implements HttpClientPort {
  async get<T>(url: string): Promise<T> {
    // Implementación con Axios
  }
}
```

**Cache Adapter** (`adapters/outbound/redis-cache.adapter.ts`):
```typescript
@Injectable()
export class RedisCacheAdapter implements CachePort {
  async get<T>(key: string): Promise<T | null> {
    // Implementación con Redis
  }
}
```

## 🔄 Flujo de Datos

### Request Flow

```
1. HTTP Request
   ↓
2. ItemsController (Inbound Adapter)
   ↓
3. GetItemService (Use Case - Application Layer)
   ↓
4. ItemRepositoryPort (Domain Interface)
   ↓
5. MeliItemRepository (Outbound Adapter)
   ↓
6. HttpClientPort (Domain Interface)
   ↓
7. AxiosHttpClientAdapter (Outbound Adapter)
   ↓
8. External API
```

### Dependency Flow

```
Infrastructure → Application → Domain

Controllers ──→ Use Cases ──→ Entities
    ↓              ↓            ↑
Adapters ──→ Ports (I) ────────┘
```

## 🎨 Patrones de Diseño

### 1. Dependency Injection

```typescript
// Definición del símbolo
export const ITEM_REPOSITORY_PORT = Symbol('ITEM_REPOSITORY_PORT');

// Registro en módulo
providers: [
  {
    provide: ITEM_REPOSITORY_PORT,
    useClass: MeliItemRepository,
  },
]

// Inyección
constructor(
  @Inject(ITEM_REPOSITORY_PORT)
  private readonly itemRepository: ItemRepositoryPort,
) {}
```

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

## 📊 Comparación con Layered Architecture

| Aspecto | Layered | Hexagonal |
|---------|---------|-----------|
| **Dependencias** | Top → Down | Outside → Inside |
| **Dominio** | Conoce infraestructura | Independiente |
| **Testing** | Difícil mockear | Fácil con puertos |
| **Flexibilidad** | Acoplado a frameworks | Desacoplado |
| **Complejidad** | Menor | Mayor (más archivos) |

## 🎓 Conclusión

La Arquitectura Hexagonal proporciona:

- ✅ **Separación clara** de responsabilidades
- ✅ **Independencia** del dominio
- ✅ **Testabilidad** mejorada
- ✅ **Flexibilidad** para cambios
- ✅ **Mantenibilidad** a largo plazo

**Trade-off**: Mayor número de archivos y abstracciones, pero con beneficios significativos en proyectos grandes y de larga duración.
