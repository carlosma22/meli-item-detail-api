#!/bin/bash

echo "=== Verificando estado de contenedores ==="
docker-compose ps

echo ""
echo "=== Logs del contenedor item-api (últimas 100 líneas) ==="
docker-compose logs --tail=100 app

echo ""
echo "=== Verificando Redis ==="
docker exec item-api-redis redis-cli ping 2>/dev/null && echo "✅ Redis OK" || echo "❌ Redis no responde"

echo ""
echo "=== Verificando Prometheus ==="
curl -s http://localhost:9093/-/healthy && echo "✅ Prometheus OK" || echo "❌ Prometheus no responde"

echo ""
echo "=== Verificando Grafana ==="
curl -s http://localhost:3002/api/health && echo "✅ Grafana OK" || echo "❌ Grafana no responde"
