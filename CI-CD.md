# CI/CD - GitHub Actions

## 📋 Descripción General

El proyecto implementa CI/CD completo con GitHub Actions para automatizar testing, building, y deployment.

---

## 🔄 Workflows Implementados

### 1. **CI - Tests & Linting** (`.github/workflows/ci.yml`)

Se ejecuta en:
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

**Jobs:**
- ✅ **Lint**: ESLint y formato de código
- ✅ **Test**: Tests unitarios con cobertura
- ✅ **Build**: Build de imagen Docker
- ✅ **Security**: Escaneo de vulnerabilidades (npm audit + Trivy)

---

### 2. **CD - Build & Deploy** (`.github/workflows/cd.yml`)

Se ejecuta en:
- Push a `main`
- Tags con formato `v*.*.*` (ej: `v1.0.0`)

**Jobs:**
- ✅ **Build and Push**: Construye y publica imagen Docker a GitHub Container Registry
- ✅ **Deploy Staging**: Despliega a servidor de staging (rama `develop`)
- ✅ **Deploy Production**: Despliega a producción (tags `v*.*.*`)

---

### 3. **Docker Compose Test** (`.github/workflows/docker-compose-test.yml`)

Prueba el stack completo:
- ✅ Build de todas las imágenes
- ✅ Inicio de servicios (app, redis, prometheus, grafana)
- ✅ Health checks de todos los servicios
- ✅ Tests de integración

---

## 🔐 Secrets Requeridos

Configura estos secrets en GitHub: **Settings → Secrets and variables → Actions**

### **Para Deployment:**

```
STAGING_HOST          # IP o dominio del servidor de staging
STAGING_USER          # Usuario SSH para staging
STAGING_SSH_KEY       # Clave privada SSH para staging

PRODUCTION_HOST       # IP o dominio del servidor de producción
PRODUCTION_USER       # Usuario SSH para producción
PRODUCTION_SSH_KEY    # Clave privada SSH para producción

SLACK_WEBHOOK         # (Opcional) Webhook de Slack para notificaciones
```

### **Para Container Registry:**

GitHub Actions usa `GITHUB_TOKEN` automáticamente (no requiere configuración).

---

## 📦 Publicación de Imágenes Docker

Las imágenes se publican en GitHub Container Registry:

```
ghcr.io/USUARIO/REPO:latest
ghcr.io/USUARIO/REPO:main
ghcr.io/USUARIO/REPO:v1.0.0
ghcr.io/USUARIO/REPO:main-abc1234
```

### **Pull de Imagen:**

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull
docker pull ghcr.io/USUARIO/item-api:latest
```

---

## 🚀 Proceso de Deployment

### **Staging (Automático)**

1. Push a rama `develop`
2. CI ejecuta tests
3. Build y push de imagen
4. Deploy automático a staging
5. Verificación de health checks

### **Production (Manual con Tags)**

1. Crear tag de versión:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. CI ejecuta tests
3. Build y push de imagen con tag
4. Deploy automático a producción
5. Creación de GitHub Release
6. Notificación a Slack

---

## 🧪 Testing Local del CI/CD

### **Simular CI Localmente:**

```bash
# Lint
npm run lint

# Tests
npm run test
npm run test:cov

# Build Docker
docker build -t item-api:test .

# Docker Compose test
docker-compose up -d
curl http://localhost:3001/api/v1/health
docker-compose down
```

### **Usar Act (GitHub Actions localmente):**

```bash
# Instalar act
brew install act  # macOS
# o
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Ejecutar workflow de CI
act -j lint
act -j test
act -j build

# Ejecutar todo el workflow
act push
```

---

## 📊 Badges para README

Agrega estos badges a tu `README.md`:

```markdown
![CI](https://github.com/USUARIO/REPO/workflows/CI%20-%20Tests%20%26%20Linting/badge.svg)
![CD](https://github.com/USUARIO/REPO/workflows/CD%20-%20Build%20%26%20Deploy/badge.svg)
![Docker](https://github.com/USUARIO/REPO/workflows/Docker%20Compose%20Test/badge.svg)
[![codecov](https://codecov.io/gh/USUARIO/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USUARIO/REPO)
```

---

## 🔧 Configuración del Servidor

### **Preparar Servidor para Deployment:**

```bash
# 1. Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Crear directorio del proyecto
sudo mkdir -p /var/www/item-api
sudo chown $USER:$USER /var/www/item-api

# 3. Clonar repositorio
cd /var/www/item-api
git clone https://github.com/USUARIO/REPO.git .

# 4. Crear .env
cp .env.example .env
nano .env

# 5. Login a GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 6. Crear docker-compose.override.yml para producción
cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  app:
    image: ghcr.io/USUARIO/item-api:latest
    restart: always
EOF
```

---

## 🔄 Workflow de Desarrollo

### **Feature Development:**

```bash
# 1. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub

# 4. CI ejecuta automáticamente:
#    - Lint
#    - Tests
#    - Build
#    - Security scan

# 5. Merge a develop después de aprobación
# 6. Deploy automático a staging
```

### **Release a Producción:**

```bash
# 1. Merge develop a main
git checkout main
git merge develop
git push origin main

# 2. Crear tag de versión
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. CD ejecuta automáticamente:
#    - Build y push con tag
#    - Deploy a producción
#    - Creación de release
#    - Notificación
```

---

## 📈 Monitoreo de Deployments

### **Ver Status de Workflows:**

```
https://github.com/USUARIO/REPO/actions
```

### **Ver Logs de Deployment:**

```bash
# En el servidor
docker-compose logs -f app

# Ver métricas
curl http://localhost:3001/api/v1/metrics
```

### **Rollback en Producción:**

```bash
# Opción 1: Revertir a tag anterior
cd /var/www/item-api
git checkout v1.0.0
docker-compose pull
docker-compose up -d

# Opción 2: Usar imagen específica
docker-compose down
docker pull ghcr.io/USUARIO/item-api:v1.0.0
# Editar docker-compose.yml para usar esa versión
docker-compose up -d
```

---

## 🛡️ Security Best Practices

1. ✅ **Secrets Management**: Usar GitHub Secrets, nunca commitear secrets
2. ✅ **Vulnerability Scanning**: Trivy escanea en cada CI
3. ✅ **Dependency Audit**: npm audit en cada CI
4. ✅ **Image Signing**: Attestation de imágenes Docker
5. ✅ **SSH Keys**: Usar claves SSH específicas para deployment
6. ✅ **Least Privilege**: Usuario de deployment con permisos mínimos

---

## 🔍 Troubleshooting

### **CI Falla en Tests:**

```bash
# Ejecutar tests localmente
npm run test

# Ver cobertura
npm run test:cov

# Verificar lint
npm run lint
```

### **Build de Docker Falla:**

```bash
# Build local
docker build -t item-api:test .

# Ver logs
docker build --progress=plain -t item-api:test .
```

### **Deployment Falla:**

```bash
# Verificar conexión SSH
ssh USER@HOST

# Ver logs del servidor
ssh USER@HOST "cd /var/www/item-api && docker-compose logs app"

# Verificar que el servidor tiene acceso al registry
ssh USER@HOST "docker pull ghcr.io/USUARIO/item-api:latest"
```

---

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Act - Run GitHub Actions Locally](https://github.com/nektos/act)

---

## ✅ Checklist de Configuración

- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados en GitHub
- [ ] Servidor preparado con Docker
- [ ] SSH keys configuradas
- [ ] `.env` configurado en servidores
- [ ] GitHub Container Registry configurado
- [ ] Badges agregados al README
- [ ] Documentación actualizada
- [ ] Primer deployment exitoso

---

**¡Tu proyecto está listo para CI/CD production-ready!** 🚀
