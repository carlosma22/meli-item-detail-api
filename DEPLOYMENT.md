# Guía de Despliegue - Item API

## 🚀 Despliegue con Docker

### Prerequisitos

- Docker instalado (versión 20.10+)
- Docker Compose instalado (versión 2.0+)
- Node.js 20+ (solo para desarrollo local)

---

## 📦 Construcción de la Imagen Docker

### Opción 1: Build Manual

```bash
# Construir la imagen
docker build -t item-api:latest .

# Verificar que la imagen se creó
docker images | grep item-api
```

### Opción 2: Build con Docker Compose (Recomendado)

```bash
# Construir todas las imágenes
docker-compose build

# O construir solo la app
docker-compose build app
```

---

## 🎯 Despliegue Completo

### Paso 1: Construir la Imagen

```bash
# Desde el directorio raíz del proyecto
docker-compose build app
```

### Paso 2: Iniciar Todos los Servicios

```bash
# Iniciar en modo detached (background)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app
```

### Paso 3: Verificar que Todo Funciona

```bash
# Verificar que los contenedores están corriendo
docker-compose ps

# Deberías ver:
# - item-api (app)
# - item-api-redis
# - item-api-prometheus
# - item-api-grafana
```

### Paso 4: Probar los Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Métricas
curl http://localhost:3001/metrics

# Swagger
# Abre en navegador: http://localhost:3001/api/docs

# Grafana
# Abre en navegador: http://localhost:3002 (admin/admin)

# Prometheus
# Abre en navegador: http://localhost:9093
```

---

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart app

# Ver logs
docker-compose logs -f app
docker-compose logs -f redis
docker-compose logs -f grafana
```

### Reconstruir la Aplicación

```bash
# Si hiciste cambios en el código
docker-compose build app
docker-compose up -d app

# O forzar reconstrucción sin cache
docker-compose build --no-cache app
```

### Ejecutar Comandos en el Contenedor

```bash
# Acceder al shell del contenedor
docker exec -it item-api sh

# Ver variables de entorno
docker exec item-api env

# Ver logs de la aplicación
docker logs item-api -f
```

---

## 🌐 Puertos Expuestos

| Servicio | Puerto Host | Puerto Contenedor | Descripción |
|----------|-------------|-------------------|-------------|
| API | 3001 | 3000 | Aplicación NestJS |
| Metrics | 9092 | 9090 | Endpoint de métricas |
| Redis | 6380 | 6379 | Cache Redis |
| Prometheus | 9093 | 9090 | Prometheus UI |
| Grafana | 3002 | 3000 | Grafana UI |

---

## 🐛 Troubleshooting

### La imagen no se construye

```bash
# Limpiar cache de Docker
docker builder prune

# Reconstruir sin cache
docker-compose build --no-cache app
```

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Verificar que Redis está corriendo
docker-compose ps redis

# Reiniciar Redis si es necesario
docker-compose restart redis
```

### Error de conexión a Redis

```bash
# Verificar que Redis está saludable
docker exec item-api-redis redis-cli ping
# Debería responder: PONG

# Verificar red de Docker
docker network ls
docker network inspect item-api-network
```

### Problemas con volúmenes

```bash
# Eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d
```

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
# Linux/Mac
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# Cambiar el puerto en docker-compose.yml
# Edita la línea: - '3001:3000' a otro puerto
```

---

## 🔄 Actualización de la Aplicación

### Proceso de Actualización

```bash
# 1. Detener la aplicación
docker-compose stop app

# 2. Hacer pull de los cambios (si es desde Git)
git pull

# 3. Reconstruir la imagen
docker-compose build app

# 4. Iniciar con la nueva versión
docker-compose up -d app

# 5. Verificar logs
docker-compose logs -f app
```

### Actualización sin Downtime (Blue-Green)

```bash
# 1. Construir nueva imagen con tag
docker build -t item-api:v2 .

# 2. Iniciar nuevo contenedor
docker run -d --name item-api-v2 \
  --network item-api-network \
  -p 3003:3000 \
  item-api:v2

# 3. Verificar que funciona
curl http://localhost:3003/health

# 4. Cambiar tráfico (actualizar proxy/load balancer)

# 5. Detener versión antigua
docker stop item-api
```

---

## 📊 Monitoreo en Producción

### Health Checks

```bash
# Verificar health de todos los servicios
docker-compose ps

# Health check manual
curl http://localhost:3001/health

# Debería responder:
# {
#   "status": "ok",
#   "info": { ... },
#   "error": {},
#   "details": { ... }
# }
```

### Métricas

```bash
# Ver métricas en formato Prometheus
curl http://localhost:3001/metrics

# Acceder a Grafana
# http://localhost:3002
```

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Ver últimas 100 líneas
docker-compose logs --tail=100 app

# Exportar logs a archivo
docker-compose logs app > app-logs.txt
```

---

## 🔐 Configuración de Producción

### Variables de Entorno

Crea un archivo `.env.production`:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# MercadoLibre API
MELI_API_BASE_URL=https://api.mercadolibre.com

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_seguro
REDIS_TTL=3600000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://tu-dominio.com
```

### Usar archivo de producción

```bash
docker-compose --env-file .env.production up -d
```

### Secrets Management

Para producción, usa Docker Secrets o variables de entorno seguras:

```bash
# Crear secret
echo "mi_password_seguro" | docker secret create redis_password -

# Usar en docker-compose.yml
secrets:
  redis_password:
    external: true
```

---

## 🚀 Despliegue en Cloud

### AWS ECS

```bash
# 1. Crear repositorio ECR
aws ecr create-repository --repository-name item-api

# 2. Login a ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag y push
docker tag item-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/item-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/item-api:latest

# 4. Crear task definition y service en ECS
```

### Google Cloud Run

```bash
# 1. Build y push a GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/item-api

# 2. Deploy
gcloud run deploy item-api \
  --image gcr.io/PROJECT-ID/item-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Docker Hub

```bash
# 1. Login
docker login

# 2. Tag
docker tag item-api:latest tu-usuario/item-api:latest

# 3. Push
docker push tu-usuario/item-api:latest
```

---

## 📋 Checklist de Despliegue

### Pre-Despliegue

- [ ] Código actualizado desde Git
- [ ] Variables de entorno configuradas
- [ ] Secrets configurados
- [ ] Dockerfile optimizado
- [ ] Tests pasando
- [ ] Build exitoso localmente

### Despliegue

- [ ] Imagen construida
- [ ] Contenedores iniciados
- [ ] Health checks pasando
- [ ] Métricas funcionando
- [ ] Logs sin errores

### Post-Despliegue

- [ ] Endpoints respondiendo
- [ ] Grafana mostrando datos
- [ ] Prometheus scrapeando métricas
- [ ] Redis conectado
- [ ] Documentación actualizada

---

## 🎓 Mejores Prácticas

### Seguridad

- ✅ No usar `root` en contenedores (ya implementado)
- ✅ Usar multi-stage builds (ya implementado)
- ✅ Escanear imágenes con `docker scan`
- ✅ Mantener imágenes base actualizadas
- ✅ No incluir secrets en la imagen

### Performance

- ✅ Usar `.dockerignore` (ya implementado)
- ✅ Minimizar capas en Dockerfile
- ✅ Usar cache de Docker eficientemente
- ✅ Optimizar tamaño de imagen (Alpine)

### Monitoreo

- ✅ Health checks configurados (ya implementado)
- ✅ Métricas expuestas (ya implementado)
- ✅ Logs estructurados (ya implementado)
- ✅ Alertas configuradas en Grafana

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**¡Tu aplicación está lista para producción! 🎉**
