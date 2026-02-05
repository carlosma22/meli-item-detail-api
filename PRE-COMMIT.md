# Pre-commit Hooks - Configuración Avanzada

## 📋 Descripción General

El proyecto implementa **pre-commit hooks avanzados** con Husky para garantizar la calidad del código antes de cada commit y push.

---

## 🎯 Hooks Implementados

### **1. Pre-commit** (`.husky/pre-commit`)

Se ejecuta **antes de cada commit** y valida:

- ✅ **Lint-staged**: ESLint + Prettier en archivos modificados
- ✅ **Tests relacionados**: Tests de archivos modificados
- ✅ **Type checking**: Compilación TypeScript
- ✅ **Formato**: JSON, MD, YAML

**Archivos validados:**
```javascript
{
  "*.ts": [
    "eslint --fix",                    // Corrige errores de linting
    "prettier --write",                // Formatea código
    "jest --findRelatedTests --bail"   // Tests relacionados
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"                 // Formatea archivos de config
  ],
  "package.json": [
    "npm audit --audit-level=moderate" // Auditoría de seguridad
  ]
}
```

---

### **2. Commit-msg** (`.husky/commit-msg`)

Valida el **formato del mensaje de commit** usando Conventional Commits.

**Formato requerido:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Agregar o modificar tests
- `build`: Cambios en build system
- `ci`: Cambios en CI/CD
- `chore`: Tareas de mantenimiento
- `revert`: Revertir cambios

**Ejemplos válidos:**
```bash
feat(items): add pagination to search endpoint
fix(cache): resolve redis connection timeout
docs(readme): update installation instructions
refactor(metrics): simplify interceptor logic
test(items): add unit tests for controller
```

**Ejemplos inválidos:**
```bash
❌ Added new feature          # No type
❌ FEAT: new feature          # Type en mayúsculas
❌ feat: New feature.         # Punto al final
❌ feat:new feature           # Sin espacio después de :
```

---

### **3. Pre-push** (`.husky/pre-push`)

Se ejecuta **antes de cada push** y valida:

- ✅ **Todos los tests**: Suite completa
- ✅ **Cobertura de tests**: Mínimo requerido
- ✅ **Console.log**: Detecta console.log en código (excepto tests)
- ✅ **Security audit**: npm audit con nivel high

**Validaciones:**
```bash
1. npm run test           # Todos los tests
2. npm run test:cov       # Cobertura
3. grep console.log       # Busca console.log
4. npm audit --high       # Vulnerabilidades críticas
```

---

## 🚀 Instalación y Configuración

### **Instalar Dependencias:**

```bash
# Instalar commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Husky ya está instalado (ver package.json)
```

### **Inicializar Husky:**

```bash
# Preparar hooks
npm run prepare

# Hacer scripts ejecutables (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### **Verificar Instalación:**

```bash
# Ver hooks instalados
ls -la .husky/

# Deberías ver:
# - pre-commit
# - commit-msg
# - pre-push
```

---

## 🧪 Probar Hooks

### **Probar Pre-commit:**

```bash
# Hacer cambios en un archivo
echo "// test" >> src/main.ts

# Intentar commit
git add src/main.ts
git commit -m "test: testing pre-commit"

# El hook ejecutará:
# - ESLint
# - Prettier
# - Tests relacionados
# - Type checking
```

### **Probar Commit-msg:**

```bash
# Commit con mensaje inválido
git commit -m "added feature"
# ❌ Falla: no tiene type

# Commit con mensaje válido
git commit -m "feat: add new feature"
# ✅ Pasa
```

### **Probar Pre-push:**

```bash
# Intentar push
git push origin develop

# El hook ejecutará:
# - Todos los tests
# - Cobertura
# - Buscar console.log
# - Security audit
```

---

## ⚙️ Configuración Avanzada

### **Ajustar Cobertura Mínima:**

Edita `jest.config.js` o `package.json`:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### **Personalizar Commitlint:**

Edita `.commitlintrc.json`:

```json
{
  "rules": {
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100]
  }
}
```

### **Excluir Archivos de Lint-staged:**

Edita `package.json`:

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "!(**/migrations/*.ts)": [
      "eslint --fix"
    ]
  }
}
```

---

## 🔧 Scripts Útiles

```bash
# Validar todo manualmente
npm run validate

# Solo lint
npm run lint

# Solo format
npm run format

# Solo type check
npm run type-check

# Tests en archivos modificados
npm run test:changed

# Bypass hooks (NO RECOMENDADO)
git commit --no-verify -m "message"
git push --no-verify
```

---

## 🚫 Bypass Hooks (Emergencias)

**Solo en casos excepcionales:**

```bash
# Bypass pre-commit
git commit --no-verify -m "emergency fix"

# Bypass pre-push
git push --no-verify

# Bypass ambos
HUSKY=0 git commit -m "message"
HUSKY=0 git push
```

⚠️ **Advertencia**: Usar `--no-verify` solo en emergencias. El código sin validar puede romper el build.

---

## 📊 Workflow de Desarrollo

### **Desarrollo Normal:**

```bash
# 1. Hacer cambios
vim src/items/items.service.ts

# 2. Agregar a staging
git add src/items/items.service.ts

# 3. Commit (pre-commit se ejecuta automáticamente)
git commit -m "feat(items): add pagination support"

# Pre-commit ejecuta:
# ✅ ESLint en items.service.ts
# ✅ Prettier en items.service.ts
# ✅ Tests relacionados con items.service.ts
# ✅ Type checking

# 4. Push (pre-push se ejecuta automáticamente)
git push origin feature/pagination

# Pre-push ejecuta:
# ✅ Todos los tests
# ✅ Cobertura
# ✅ Buscar console.log
# ✅ Security audit
```

### **Fix Rápido:**

```bash
# Si pre-commit falla por linting
npm run lint

# Si falla por formato
npm run format

# Si falla por tests
npm run test

# Si falla por types
npm run type-check

# Luego reintentar commit
git commit -m "feat: add feature"
```

---

## 🐛 Troubleshooting

### **Hook no se ejecuta:**

```bash
# Reinstalar hooks
rm -rf .husky
npm run prepare

# Verificar permisos (Linux/Mac)
chmod +x .husky/*
```

### **Commitlint no funciona:**

```bash
# Verificar instalación
npx commitlint --version

# Probar manualmente
echo "feat: test" | npx commitlint

# Reinstalar
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### **Tests muy lentos en pre-commit:**

Edita `.husky/pre-commit` y comenta la línea de tests:

```bash
# npm run test -- --onlyChanged --passWithNoTests
```

Los tests se ejecutarán solo en pre-push.

### **Windows: Hook no ejecuta:**

```bash
# Usar Git Bash o WSL
# O configurar Husky para Windows:
npm install --save-dev cross-env
```

---

## 📈 Métricas y Reportes

### **Ver Cobertura:**

```bash
npm run test:cov

# Abrir reporte HTML
open coverage/lcov-report/index.html
```

### **Ver Resultados de Audit:**

```bash
npm audit

# Ver detalles
npm audit --json

# Fix automático
npm audit fix
```

---

## 🎓 Mejores Prácticas

1. ✅ **Commits pequeños**: Facilita que los hooks sean rápidos
2. ✅ **Mensajes descriptivos**: Sigue Conventional Commits
3. ✅ **Tests antes de commit**: Ejecuta tests localmente primero
4. ✅ **No usar --no-verify**: Solo en emergencias
5. ✅ **Mantener dependencias actualizadas**: `npm audit fix`
6. ✅ **Revisar coverage**: Mantener >80%
7. ✅ **Limpiar console.log**: Antes de commit
8. ✅ **Type checking**: Resolver errores de TypeScript

---

## 📚 Recursos

- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lint-staged](https://github.com/okonet/lint-staged)

---

## ✅ Checklist de Configuración

- [ ] Husky instalado y configurado
- [ ] Commitlint instalado
- [ ] Hooks creados (pre-commit, commit-msg, pre-push)
- [ ] Scripts ejecutables (chmod +x)
- [ ] Lint-staged configurado
- [ ] Tests funcionando
- [ ] Primer commit exitoso con hooks
- [ ] Documentación leída

---

**¡Tu proyecto ahora tiene pre-commit hooks production-ready!** 🚀
