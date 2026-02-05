# Grafana - Visualización de Métricas

## 📊 Descripción General

Grafana está integrado en el proyecto para proporcionar visualización profesional de las métricas recolectadas por Prometheus. Incluye dashboards predefinidos listos para usar.

## 🚀 Inicio Rápido

### Iniciar Grafana

```bash
# Iniciar todos los servicios (incluye Grafana)
docker-compose up -d

# O solo Grafana y sus dependencias
docker-compose up -d grafana
```

### Acceder a Grafana

```
URL: http://localhost:3002
Usuario: admin
Contraseña: admin
```

**Nota:** En el primer acceso, Grafana te pedirá cambiar la contraseña. Puedes omitir este paso si es un ambiente de desarrollo.

---

## 📈 Dashboards Incluidos

### 1. **Item API - Overview**

Dashboard principal con métricas generales del sistema.

**Paneles:**
- ✅ **HTTP Requests per Second**: Tasa de requests HTTP
- ✅ **P95 Latency**: Latencia percentil 95
- ✅ **Error Rate (5xx)**: Tasa de errores del servidor
- ✅ **Cache Hit Rate**: Efectividad del cache
- ✅ **Items Retrieved per Second**: Items recuperados por estado
- ✅ **Memory Usage**: Uso de memoria de la aplicación

**Uso recomendado:** Monitoreo general y detección rápida de problemas.

---

### 2. **Item API - Business Metrics**

Dashboard enfocado en métricas de negocio y API externa.

**Paneles:**
- ✅ **Items Retrieved Rate**: Tasa de items recuperados (success/not_found/error)
- ✅ **Item Searches Rate**: Tasa de búsquedas realizadas
- ✅ **Item Retrieval Success Rate**: Porcentaje de éxito en recuperación
- ✅ **Search Success Rate**: Porcentaje de éxito en búsquedas
- ✅ **Cache Hits vs Misses by Operation**: Comparación de cache por operación
- ✅ **MercadoLibre API Calls by Endpoint**: Llamadas a API externa por endpoint
- ✅ **MercadoLibre API Latency**: Latencia de API externa (P50 y P95)

**Uso recomendado:** Análisis de negocio y performance de integraciones externas.

---

## 🎯 Navegación en Grafana

### Acceder a los Dashboards

1. Inicia sesión en Grafana
2. En el menú lateral, haz clic en **Dashboards** (icono de cuatro cuadrados)
3. Verás la carpeta **"Item API"** con los dashboards disponibles
4. Haz clic en el dashboard que desees visualizar

### Cambiar el Rango de Tiempo

En la esquina superior derecha, puedes seleccionar:
- **Last 5 minutes**
- **Last 15 minutes**
- **Last 30 minutes**
- **Last 1 hour** (por defecto)
- **Last 3 hours**
- **Last 6 hours**
- **Last 12 hours**
- **Last 24 hours**
- **Custom range**

### Refrescar Datos

- **Manual:** Botón de refresh en la esquina superior derecha
- **Auto-refresh:** Selecciona un intervalo (5s, 10s, 30s, 1m, 5m, etc.)

---

## 🔧 Configuración

### Datasource de Prometheus

El datasource ya está configurado automáticamente:

```yaml
Name: Prometheus
Type: prometheus
URL: http://prometheus:9090
Access: proxy
```

**Verificar conexión:**
1. Ve a **Configuration** → **Data Sources**
2. Haz clic en **Prometheus**
3. Scroll hasta abajo y haz clic en **Save & Test**
4. Deberías ver: ✅ "Data source is working"

---

## 📊 Crear Dashboards Personalizados

### Crear un Nuevo Dashboard

1. Haz clic en **+** en el menú lateral
2. Selecciona **Dashboard**
3. Haz clic en **Add new panel**

### Agregar un Panel

**Ejemplo: Requests por Método HTTP**

1. En **Query**, selecciona **Prometheus** como datasource
2. Ingresa la query:
   ```promql
   sum by (method) (rate(http_requests_total[5m]))
   ```
3. En **Legend**, usa: `{{method}}`
4. Configura el título del panel
5. Haz clic en **Apply**

### Queries Útiles para Paneles

Ver el archivo [`prometheus-queries.md`](./prometheus-queries.md) para más ejemplos.

---

## 🚨 Alertas en Grafana

### Configurar una Alerta

1. Edita un panel existente
2. Ve a la pestaña **Alert**
3. Haz clic en **Create Alert**
4. Configura las condiciones:

**Ejemplo: Alerta de Alta Latencia**

```
WHEN avg() OF query(A, 5m, now) IS ABOVE 1
```

5. Configura notificaciones (email, Slack, etc.)
6. Guarda el panel

### Canales de Notificación

1. Ve a **Alerting** → **Notification channels**
2. Haz clic en **Add channel**
3. Selecciona el tipo (Email, Slack, Webhook, etc.)
4. Configura los detalles
5. Haz clic en **Save**

---

## 💡 Tips y Mejores Prácticas

### Performance

- ✅ Usa rangos de tiempo apropiados (evita queries muy largas)
- ✅ Limita el número de paneles por dashboard (máximo 12-15)
- ✅ Usa variables para filtrar datos dinámicamente
- ✅ Configura auto-refresh solo cuando sea necesario

### Visualización

- ✅ Usa colores consistentes (verde=success, amarillo=warning, rojo=error)
- ✅ Agrupa paneles relacionados
- ✅ Usa gauges para porcentajes y valores únicos
- ✅ Usa time series para tendencias
- ✅ Agrega descripciones a los paneles

### Organización

- ✅ Crea carpetas para diferentes áreas (API, Infrastructure, Business)
- ✅ Usa tags para categorizar dashboards
- ✅ Documenta las queries complejas
- ✅ Exporta dashboards como JSON para versionarlos

---

## 📦 Exportar/Importar Dashboards

### Exportar un Dashboard

1. Abre el dashboard
2. Haz clic en el icono de configuración (⚙️)
3. Selecciona **JSON Model**
4. Copia el JSON o haz clic en **Save to file**

### Importar un Dashboard

1. Haz clic en **+** → **Import**
2. Pega el JSON o sube el archivo
3. Selecciona el datasource (Prometheus)
4. Haz clic en **Import**

---

## 🎨 Paneles Recomendados Adicionales

### Panel de Endpoints más Lentos

```promql
topk(5, histogram_quantile(0.95, sum by (route, le) (rate(http_request_duration_seconds_bucket[5m]))))
```

### Panel de Error Rate por Endpoint

```promql
sum by (route) (rate(http_requests_total{status_code=~"5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))
```

### Panel de Throughput Total

```promql
sum(rate(http_requests_total[5m]))
```

### Panel de Event Loop Lag

```promql
nodejs_eventloop_lag_seconds
```

### Panel de Active Connections

```promql
http_requests_in_progress
```

---

## 🔍 Variables en Dashboards

Las variables permiten filtrar datos dinámicamente.

### Crear una Variable

1. Ve a **Dashboard settings** (⚙️)
2. Selecciona **Variables**
3. Haz clic en **Add variable**

**Ejemplo: Variable de Endpoint**

```
Name: endpoint
Type: Query
Query: label_values(http_requests_total, route)
```

### Usar Variables en Queries

```promql
rate(http_requests_total{route="$endpoint"}[5m])
```

---

## 📱 Grafana Mobile

Grafana tiene aplicaciones móviles para iOS y Android:

1. Descarga la app "Grafana" desde tu tienda de apps
2. Agrega tu instancia: `http://localhost:3002`
3. Inicia sesión con tus credenciales
4. Accede a tus dashboards desde cualquier lugar

---

## 🛠️ Troubleshooting

### Grafana no inicia

```bash
# Ver logs
docker-compose logs grafana

# Reiniciar servicio
docker-compose restart grafana
```

### No se ven datos en los dashboards

1. Verifica que Prometheus esté funcionando:
   ```bash
   curl http://localhost:9093/-/healthy
   ```

2. Verifica que la aplicación esté generando métricas:
   ```bash
   curl http://localhost:3000/metrics
   ```

3. Verifica la conexión del datasource en Grafana

### Dashboards no aparecen

```bash
# Verificar que los archivos existen
ls -la grafana/dashboards/

# Verificar permisos
chmod -R 755 grafana/

# Reiniciar Grafana
docker-compose restart grafana
```

### Cambiar credenciales de admin

```bash
# Conectarse al contenedor
docker exec -it item-api-grafana grafana-cli admin reset-admin-password newpassword
```

---

## 🔐 Seguridad en Producción

### Cambiar Credenciales

En producción, **SIEMPRE** cambia las credenciales por defecto:

```yaml
# docker-compose.yml
environment:
  - GF_SECURITY_ADMIN_USER=tu_usuario
  - GF_SECURITY_ADMIN_PASSWORD=tu_password_seguro
```

### Habilitar HTTPS

```yaml
environment:
  - GF_SERVER_PROTOCOL=https
  - GF_SERVER_CERT_FILE=/path/to/cert.pem
  - GF_SERVER_CERT_KEY=/path/to/key.pem
```

### Autenticación Externa

Grafana soporta:
- OAuth (Google, GitHub, GitLab)
- LDAP
- SAML
- Auth Proxy

Ver [documentación oficial](https://grafana.com/docs/grafana/latest/auth/) para configuración.

---

## 📚 Recursos Adicionales

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Grafana Dashboards Library](https://grafana.com/grafana/dashboards/)
- [Prometheus Queries](./prometheus-queries.md)
- [Metrics Documentation](./METRICS.md)

---

## 🎓 Tutoriales Recomendados

### Crear un Dashboard desde Cero

1. **Planifica tu dashboard**: Define qué métricas necesitas visualizar
2. **Crea paneles básicos**: Empieza con queries simples
3. **Refina visualizaciones**: Ajusta colores, leyendas, unidades
4. **Agrega contexto**: Títulos descriptivos y descripciones
5. **Organiza el layout**: Agrupa paneles relacionados
6. **Configura alertas**: Para métricas críticas
7. **Documenta**: Exporta el JSON y guárdalo en el repositorio

### Mejores Prácticas de Dashboards

- **Principio de la pirámide**: Información general arriba, detalles abajo
- **Regla del 7±2**: No más de 5-9 paneles por dashboard
- **Colores semánticos**: Verde=bueno, Amarillo=advertencia, Rojo=crítico
- **Consistencia**: Usa los mismos rangos de tiempo en todos los paneles
- **Contexto**: Agrega anotaciones para eventos importantes

---

## 🚀 Próximos Pasos

1. ✅ Explora los dashboards predefinidos
2. ✅ Personaliza los paneles según tus necesidades
3. ✅ Configura alertas para métricas críticas
4. ✅ Crea dashboards adicionales para casos específicos
5. ✅ Integra con canales de notificación (Slack, email)
6. ✅ Exporta y versiona tus dashboards en Git

---

**¡Disfruta visualizando tus métricas con Grafana! 📊✨**
