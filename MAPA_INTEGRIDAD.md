# 🗺️ MAPA DE INTEGRIDAD - CRGM-API v4.0.0

**Fecha de generación:** 2026-02-11  
**Service Worker Version:** 3.0.0  
**Estado:** ✅ VERIFICADO

---

## 📋 ESTRUCTURA OFICIAL DE ARCHIVOS

### 🎯 Archivos Raíz Principales

| Archivo | Estado | Propósito | Crítico |
|---------|--------|-----------|---------|
| `index.html` | ✅ OK | Punto de entrada principal | SÍ |
| `manifest.json` | ✅ OK | Configuración PWA | SÍ |
| `sw.js` | ✅ OK v3.0.0 | Service Worker offline-first | SÍ |
| `README.md` | ✅ OK | Documentación principal | NO |
| `INDICE_ALGORITMICO_ESTADO.md` | ✅ OK | Registro de tareas completadas | NO |

### 🎨 CSS (Estilos)

| Archivo | Estado | Propósito |
|---------|--------|-----------|
| `css/industrial.css` | ✅ OK | Tema industrial dark/light + responsive |

### 🖼️ Assets (Recursos)

| Archivo | Estado | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `assets/icons/icon-192.png` | ✅ OK | 192x192 | Icono PWA estándar |
| `assets/icons/icon-512.png` | ✅ OK | 512x512 | Icono PWA alta resolución |

### 💻 JavaScript - Core (js/core/)

| Archivo | Estado | Propósito | Crítico |
|---------|--------|-----------|---------|
| `js/core/database.js` | ✅ OK | Gestión IndexedDB | SÍ |
| `js/core/auth.js` | ✅ OK v1.0.0 | Sistema de autenticación | SÍ |
| `js/core/modules.js` | ✅ OK | Gestor modular | SÍ |

**Cambios recientes en Core:**
- ✅ `auth.js`: Login case-insensitive implementado
- ✅ `database.js`: Validación `_ensureDB()` agregada

### 📦 JavaScript - Módulos (js/modules/)

| Archivo | Estado | Propósito | Crítico |
|---------|--------|-----------|---------|
| `js/modules/diagrams.js` | ✅ OK | Gestión de diagramas eléctricos | SÍ |
| `js/modules/diagram-editor.js` | ✅ OK v3.0.0 | Editor visual de diagramas IEC | SÍ |
| `js/modules/projects.js` | ✅ OK | Gestión de proyectos | SÍ |
| `js/modules/sync-manager.js` | ✅ OK | Exportación/Importación datos | NO |

**Cambios recientes en Módulos:**
- ✅ `diagram-editor.js`: Sistema Undo/Redo implementado (50 niveles)
- ✅ Atajos de teclado: Ctrl+Z (Undo), Ctrl+Y (Redo), Delete, Escape

### 🚀 JavaScript - App Principal

| Archivo | Estado | Propósito | Crítico |
|---------|--------|-----------|---------|
| `js/app.js` | ✅ OK v4.0.0 | Controlador principal + navegación | SÍ |

**Cambios recientes en App:**
- ✅ Botón ♻️ de actualización forzada agregado
- ✅ Función `handleForceRefresh()` implementada

---

## ⚠️ ARCHIVOS OBSOLETOS / REDUNDANTES

### 📁 Carpeta `crgm-app/`

**Estado:** 🟡 OBSOLETO - Mantener para referencia histórica

Esta carpeta contiene una versión antigua/alternativa de la aplicación que **NO se usa actualmente**. La aplicación principal corre desde la raíz (`/`).

| Archivo | Estado | Nota |
|---------|--------|------|
| `crgm-app/index.html` | 🟡 Obsoleto | Usa placeholder en lugar de iconos reales |
| `crgm-app/manifest.json` | 🟡 Obsoleto | Apunta a URLs externas (placeholder) |
| `crgm-app/sw.js` | 🟡 Obsoleto | Versión antigua del Service Worker |
| `crgm-app/js/` | 🟡 Obsoleto | Módulos antiguos |

**Recomendación:** Mover a carpeta `_archive/` o eliminar en próxima limpieza.

---

## 🔐 CONFIGURACIÓN DE SEGURIDAD

### Sistema de Autenticación

- **Token por defecto:** `CRGM2026`
- **Case-insensitive:** ✅ SÍ (acepta mayúsculas/minúsculas)
- **Nivel Administrador:** 999
- **Base de datos:** IndexedDB `crgm_industrial_db`

### Almacenamiento

- **LocalStorage:** Sesión de usuario (`crgm_session`)
- **IndexedDB Stores:**
  - `users` - Usuarios y tokens
  - `assets` - Activos industriales
  - `logs` - Registro de actividades
  - `inventory` - Inventario
  - `config` - Configuración global

---

## 📊 DEPENDENCIAS Y MÓDULOS

### Orden de Inicialización

```
1. DatabaseManager (database.js)
   ↓
2. AuthManager (auth.js)
   ↓
3. ModuleManager (modules.js)
   ↓
4. SyncManager (sync-manager.js)
   ↓
5. DiagramsModule (diagrams.js)
   ↓
6. ProjectsModule (projects.js)
```

### Exports/Imports

- **Todos los módulos core:** `export default [NombreModulo]`
- **App principal:** Importa y expone en `window.CRGM`

---

## 🧪 VERIFICACIÓN DE INTEGRIDAD

### Checklist de Funcionamiento

- [x] Index.html carga correctamente
- [x] Manifest.json apunta a iconos correctos
- [x] Service Worker registra sin errores
- [x] IndexedDB se crea correctamente
- [x] Token Rey se genera automáticamente
- [x] Login funciona con token correcto
- [x] Módulos Diagrams y Projects cargan
- [x] Editor de diagramas funciona con Undo/Redo
- [x] Botón de actualización forzada funciona
- [x] Tema dark/light cambia correctamente

### Comandos de Verificación

```bash
# Verificar archivos principales
ls -lh index.html manifest.json sw.js

# Verificar estructura JS
ls -R js/

# Verificar iconos
ls -lh assets/icons/

# Iniciar servidor de prueba
python3 -m http.server 8000
# O
./iniciar.sh
```

---

## 🔄 CHANGELOG RECIENTE

### Versión 4.0.0 (2026-02-11)

**Mejoras de Autenticación:**
- ✅ Login case-insensitive implementado
- ✅ Mejor manejo de errores en DB
- ✅ Logs detallados para debugging
- ✅ Botón ♻️ de reset forzado

**Editor de Diagramas:**
- ✅ Sistema Undo/Redo (50 niveles)
- ✅ Atajos de teclado profesionales
- ✅ Limpieza de listeners al destruir

**Service Worker:**
- ✅ Actualizado a v3.0.0
- ✅ Cache name: `crgm-api-v3`

---

## 📝 NOTAS IMPORTANTES

1. **Iconos PWA:** Los archivos en `assets/icons/` son REALES (no placeholders). La app en `crgm-app/` usa placeholders externos.

2. **Service Worker:** Siempre incrementar versión al hacer cambios críticos en JS/HTML para forzar actualización en clientes.

3. **IndexedDB:** La versión actual es `1`. Si cambias el esquema, incrementa `DB_VERSION` en `database.js`.

4. **Módulos Externos:** La carpeta `Modulos/` contiene herramientas SMED y Tools que son independientes de la app principal.

---

## 🛠️ MANTENIMIENTO

### Limpieza Recomendada

1. **Archivos Zone.Identifier:** Eliminar todos los archivos `*.Zone.Identifier` (vienen de Windows).
2. **Carpeta crgm-app:** Mover a `_archive/` o eliminar.
3. **Logs de consola:** Revisar `CONSOLA/` periódicamente.

### Actualización de Service Worker

Cada vez que modifiques archivos críticos:

```javascript
// En sw.js
const CACHE_NAME = 'crgm-api-vX'; // Incrementar X
const VERSION = 'X.Y.Z'; // Versión semántica
```

---

## ✅ CERTIFICACIÓN

Este mapa refleja el estado actual de CRGM-API después de las siguientes correcciones:

- Sistema de autenticación case-insensitive
- Editor de diagramas con Undo/Redo
- Botón de actualización forzada
- Service Worker v3.0.0

**Estado General:** ✅ **OPERATIVO Y ESTABLE**

---

*Última actualización: 2026-02-11 10:37 GMT-6*
