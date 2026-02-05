#!/bin/bash

echo "🚀 Generando tráfico para métricas de Grafana..."
echo ""

# Contador de requests
TOTAL=0

echo "📊 1. Health checks (20 requests)..."
for i in {1..20}; do
  curl -s http://localhost:3001/health > /dev/null
  TOTAL=$((TOTAL + 1))
  echo -ne "  Progress: $i/20\r"
  sleep 0.3
done
echo -e "\n  ✅ Health checks completados"

echo ""
echo "📈 2. Métricas endpoint (10 requests)..."
for i in {1..10}; do
  curl -s http://localhost:3001/metrics > /dev/null
  TOTAL=$((TOTAL + 1))
  echo -ne "  Progress: $i/10\r"
  sleep 0.3
done
echo -e "\n  ✅ Métricas completadas"

echo ""
echo "🔍 3. Búsquedas de items (15 requests)..."
QUERIES=("iphone" "laptop" "samsung" "notebook" "tablet")
for i in {1..15}; do
  QUERY=${QUERIES[$((RANDOM % ${#QUERIES[@]}))]}
  curl -s "http://localhost:3001/api/v1/items/search?q=$QUERY&page=1&limit=10" > /dev/null
  TOTAL=$((TOTAL + 1))
  echo -ne "  Progress: $i/15 (query: $QUERY)\r"
  sleep 0.5
done
echo -e "\n  ✅ Búsquedas completadas"

echo ""
echo "📦 4. Requests a items específicos (10 requests)..."
ITEMS=("MLA1100000000" "MLA1100001000" "MLA1100002000" "MLA1100003000" "MLA1100004000")
for i in {1..10}; do
  ITEM=${ITEMS[$((RANDOM % ${#ITEMS[@]}))]}
  curl -s "http://localhost:3001/api/v1/items/$ITEM" > /dev/null
  TOTAL=$((TOTAL + 1))
  echo -ne "  Progress: $i/10 (item: $ITEM)\r"
  sleep 0.4
done
echo -e "\n  ✅ Items completados"

echo ""
echo "🎯 5. Generando algunos errores 404 (5 requests)..."
for i in {1..5}; do
  curl -s "http://localhost:3001/api/v1/items/INVALID_$i" > /dev/null
  TOTAL=$((TOTAL + 1))
  echo -ne "  Progress: $i/5\r"
  sleep 0.3
done
echo -e "\n  ✅ Errores 404 generados"

echo ""
echo "✨ ¡Tráfico generado exitosamente!"
echo "📊 Total de requests: $TOTAL"
echo ""
echo "🎨 Ahora ve a Grafana para ver los datos:"
echo "   URL: http://localhost:3002"
echo "   Usuario: admin"
echo "   Contraseña: admin"
echo ""
echo "📍 Dashboards disponibles:"
echo "   • Item API - Overview (métricas generales)"
echo "   • Item API - Business Metrics (métricas de negocio)"
echo ""
echo "⏰ Ajusta el rango de tiempo a 'Last 5 minutes' o 'Last 15 minutes'"
echo "🔄 Habilita auto-refresh en '5s' para ver datos en tiempo real"
