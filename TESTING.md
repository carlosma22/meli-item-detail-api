# Testing Guide

## 📋 Descripción General

El proyecto implementa tests unitarios con Jest para garantizar la calidad del código.

---

## 🧪 Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests en archivos modificados
npm run test:changed

# Tests de integración (e2e)
npm run test:e2e
```

---

## 📊 Tests Implementados

### **Use Cases**
- ✅ `get-item.service.spec.ts` - Tests para obtener items
- ✅ `search-items.service.spec.ts` - Tests para búsqueda de items

### **Entities**
- ✅ `item.entity.spec.ts` - Tests para entidad Item, Seller, ItemAttribute

### **Controllers**
- ✅ `items.controller.spec.ts` - Tests para ItemsController

### **Services**
- ✅ `metrics.service.spec.ts` - Tests para MetricsService

---

## 📈 Cobertura de Tests

Ver reporte de cobertura:

```bash
npm run test:cov

# Abrir reporte HTML
open coverage/lcov-report/index.html
```

---

## ✅ Tests Ejecutados Correctamente

Los tests ahora funcionan con el pre-commit hook y CI/CD.
