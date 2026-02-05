# 📊 SonarCloud Integration

Integración completa de SonarCloud para análisis estático de código y quality gates.

---

## 🎯 Características

- ✅ **Análisis automático** en cada push/PR
- ✅ **Quality Gates** - Bloquea merges si no se cumplen estándares
- ✅ **Cobertura de código** - Integrado con Jest
- ✅ **Detección de bugs** - Code smells, vulnerabilidades, duplicación
- ✅ **Métricas de calidad** - Mantenibilidad, confiabilidad, seguridad

---

## 🚀 Configuración Inicial

### **1. Crear cuenta en SonarCloud**

1. Ve a [sonarcloud.io](https://sonarcloud.io)
2. Inicia sesión con tu cuenta de GitHub
3. Autoriza SonarCloud para acceder a tu organización

### **2. Crear proyecto en SonarCloud**

1. Click en **"+"** → **"Analyze new project"**
2. Selecciona tu repositorio `item-api`
3. Click en **"Set Up"**
4. Elige **"With GitHub Actions"**
5. Copia el **SONAR_TOKEN** generado

### **3. Configurar GitHub Secrets**

En tu repositorio de GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Agrega:
- **Name**: `SONAR_TOKEN`
- **Value**: El token copiado de SonarCloud

### **4. Actualizar sonar-project.properties**

Edita `sonar-project.properties` con tus valores:

```properties
sonar.projectKey=tu-org_item-api
sonar.organization=tu-org
```

Reemplaza:
- `tu-org` con tu organización de GitHub
- `item-api` con el nombre de tu repositorio

---

## 📋 Quality Gates Configurados

### **Condiciones por Defecto**

| Métrica | Umbral | Descripción |
|---------|--------|-------------|
| **Coverage** | ≥ 80% | Cobertura de código |
| **Duplicated Lines** | ≤ 3% | Código duplicado |
| **Maintainability Rating** | A | Facilidad de mantenimiento |
| **Reliability Rating** | A | Bugs y errores |
| **Security Rating** | A | Vulnerabilidades |
| **Security Hotspots Reviewed** | 100% | Revisión de hotspots |

### **Personalizar Quality Gates**

1. En SonarCloud, ve a tu proyecto
2. Click en **"Quality Gates"**
3. Selecciona o crea un quality gate personalizado
4. Ajusta las condiciones según tus necesidades

---

## 🔄 Workflows de GitHub Actions

### **Workflow: `.github/workflows/sonarcloud.yml`**

Se ejecuta automáticamente en:
- ✅ Push a `main` o `develop`
- ✅ Pull Requests a `main` o `develop`

**Pasos:**
1. Checkout del código
2. Instalación de dependencias
3. Ejecución de tests con cobertura
4. Análisis de SonarCloud
5. Validación de Quality Gates

---

## 🔧 Uso Local (Opcional)

### **Instalar SonarScanner CLI**

**macOS:**
```bash
brew install sonar-scanner
```

**Linux:**
```bash
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
sudo mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
export PATH=$PATH:/opt/sonar-scanner/bin
```

**Windows:**
```powershell
choco install sonarscanner
```

### **Ejecutar análisis local**

```bash
# Configurar token (REQUERIDO)
export SONAR_TOKEN=tu_token_aqui

# Actualizar sonar-project.properties con tus valores:
# - sonar.projectKey=tu-org_item-api
# - sonar.organization=tu-org

# Ejecutar análisis completo
npm run sonar

# O manualmente:
npm run test:cov
sonar-scanner
```

**Nota:** El análisis local requiere:
1. `sonar-scanner` instalado
2. `SONAR_TOKEN` configurado como variable de entorno
3. `sonar-project.properties` actualizado con tu organización y proyecto

---

## 🎯 Pre-Push Hook con SonarCloud

El hook `.husky/pre-push` incluye validación opcional de SonarCloud:

```bash
# Si sonar-scanner está instalado, ejecuta análisis local
# Si no está instalado, solo muestra mensaje informativo
# Quality gates se validan siempre en CI/CD
```

**Para habilitar validación local:**
1. Instala `sonar-scanner-cli`
2. Configura `SONAR_TOKEN` en tu entorno
3. El pre-push ejecutará análisis automáticamente

---

## 📊 Métricas Disponibles

### **Cobertura de Código**
- Líneas cubiertas
- Ramas cubiertas
- Cobertura por archivo

### **Complejidad**
- Complejidad ciclomática
- Complejidad cognitiva
- Funciones complejas

### **Duplicación**
- Líneas duplicadas
- Bloques duplicados
- Archivos con duplicación

### **Problemas**
- Bugs
- Vulnerabilidades
- Code Smells
- Security Hotspots

---

## 🔍 Ver Resultados

### **En GitHub**
1. Ve a tu Pull Request
2. Verás un check de **SonarCloud**
3. Click en **"Details"** para ver el reporte completo

### **En SonarCloud**
1. Ve a [sonarcloud.io](https://sonarcloud.io)
2. Selecciona tu proyecto
3. Explora:
   - **Overview** - Resumen general
   - **Issues** - Bugs, vulnerabilidades, code smells
   - **Measures** - Métricas detalladas
   - **Code** - Análisis por archivo
   - **Activity** - Historial de análisis

---

## 🚫 Qué Hacer si Falla el Quality Gate

### **1. Revisar el reporte**
```bash
# Ver detalles en SonarCloud
# Click en el check fallido en GitHub
```

### **2. Corregir problemas**
```bash
# Bugs críticos
# Vulnerabilidades de seguridad
# Code smells mayores
```

### **3. Mejorar cobertura**
```bash
# Agregar tests faltantes
npm run test:cov

# Ver reporte de cobertura
open coverage/lcov-report/index.html
```

### **4. Reducir duplicación**
```bash
# Refactorizar código duplicado
# Extraer funciones comunes
# Usar herencia o composición
```

---

## 🎓 Best Practices

### **Mantener Quality Gates Verdes**
- ✅ Escribe tests para nuevo código
- ✅ Mantén cobertura ≥ 80%
- ✅ Corrige bugs y vulnerabilidades inmediatamente
- ✅ Refactoriza code smells regularmente
- ✅ Revisa security hotspots

### **Code Reviews**
- ✅ No apruebes PRs con quality gate rojo
- ✅ Revisa métricas de SonarCloud
- ✅ Discute problemas encontrados
- ✅ Aprende de los code smells detectados

### **Deuda Técnica**
- ✅ Monitorea la deuda técnica
- ✅ Dedica tiempo a reducirla
- ✅ No acumules code smells
- ✅ Refactoriza proactivamente

---

## 🔗 Enlaces Útiles

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)
- [SonarScanner CLI](https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner-cli/)
- [TypeScript Analysis](https://docs.sonarcloud.io/enriching/languages/typescript/)

---

## 🆘 Troubleshooting

### **Error: "Quality gate failed"**
```bash
# Revisar reporte en SonarCloud
# Corregir problemas críticos primero
# Mejorar cobertura de tests
```

### **Error: "SONAR_TOKEN not set"**
```bash
# Verificar secret en GitHub
# Regenerar token si es necesario
# Actualizar secret en GitHub
```

### **Error: "Analysis timeout"**
```bash
# Proyecto muy grande
# Aumentar timeout en workflow
# Optimizar análisis (exclusiones)
```

---

## 📈 Integración con CI/CD

El workflow de SonarCloud se integra con:
- ✅ **CI Workflow** - Tests y linting
- ✅ **CD Workflow** - Deploy solo si quality gate pasa
- ✅ **Docker Compose Test** - Tests de integración
- ✅ **Pre-commit Hooks** - Validación local

**Flujo completo:**
```
1. Commit → Pre-commit (lint, format, tests)
2. Push → Pre-push (all tests, coverage, audit)
3. GitHub → CI (lint, tests, build, security)
4. GitHub → SonarCloud (analysis, quality gates)
5. GitHub → CD (deploy if all pass)
```

---

**¡Tu código ahora tiene análisis de calidad profesional con SonarCloud!** 🎉📊✨
