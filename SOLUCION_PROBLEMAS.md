# 🔧 Solución de Problemas - CRGM-API

## Fecha: 2026-02-10
## Versión: 1.0.1 (Actualizado para Windows)

---

## 📋 PROBLEMAS RESUELTOS

### ❌ Problema 1: Error de Inicialización de la App

**Síntoma:**
- Al abrir la aplicación aparece: "Error al inicializar la aplicación"
- No se puede ingresar el token de acceso

**Causas Identificadas:**

1. **Uso incorrecto de protocolo file://**
   - Los módulos ES6 (import/export) NO funcionan con `file://`
   - **Solución:** Usar servidor HTTP local

2. **Error de orden de inicialización en app.js**
   - `window.CRGM.modules` se exponía DESPUÉS de que otros módulos lo necesitaban
   - **Corregido:** Ahora se expone ANTES de inicializar

3. **Dependencias circulares en auth.js**
   - AuthManager intentaba acceder a DatabaseManager a través de `window.CRGM.modules.get()`
   - **Corregido:** Ahora importa DatabaseManager directamente

4. **CONFIG_MODULES.json en ubicación incorrecta**
   - El archivo estaba en la raíz pero se buscaba en `/src/`
   - **Corregido:** Copiado a `/src/CONFIG_MODULES.json`

---

### ❌ Problema 2: Error de Git en Cline

**Síntoma:**
```
Error: spawn git ENOENT
    at ChildProcess._handle.onexit (node:internal/child_process:285:19)
```

**Causa:**
- Git no estaba instalado en el sistema

**Solución:**
```bash
sudo apt update
sudo apt install -y git
```

**Estado:** ✅ RESUELTO

---

## 🚀 CÓMO INICIAR LA APLICACIÓN CORRECTAMENTE

### Método 1: Script Automático (RECOMENDADO)

```bash
cd /home/crgm-unix/Desktop/CRGM-API
./iniciar.sh
```

El script automáticamente:
- Verifica Python3
- Cambia al directorio correcto
- Detecta puertos en uso
- Inicia el servidor
- Abre el navegador

### Método 2: Manual

```bash
cd /home/crgm-unix/Desktop/CRGM-API/src
python3 -m http.server 8000
```

Luego abrir: `http://localhost:8000`

---

## 🔑 CREDENCIALES DE ACCESO

**Token por defecto:** `CRGM2026`  
**Usuario:** Administrador  
**Nivel:** 999 (Token Rey - acceso total)

Este token se crea automáticamente la primera vez que inicias la aplicación.

---

## 📝 CAMBIOS REALIZADOS EN EL CÓDIGO

### 1. `/src/js/app.js`

**Antes:**
```javascript
async function initCoreModules() {
  ModuleManager.api.register(DatabaseManager);
  ModuleManager.api.register(AuthManager);
  ModuleManager.api.register(ModuleManager);
  
  await DatabaseManager.init();
  await AuthManager.init();  // ❌ FALLA: window.CRGM.modules aún no existe
  await ModuleManager.init();
  
  window.CRGM.modules = ModuleManager;  // ⚠️ Muy tarde!
}
```

**Después:**
```javascript
async function initCoreModules() {
  ModuleManager.api.register(DatabaseManager);
  ModuleManager.api.register(AuthManager);
  ModuleManager.api.register(ModuleManager);
  
  // ✅ Exponer ANTES de inicializar
  window.CRGM.modules = ModuleManager;
  window.CRGM.auth = AuthManager.api;
  window.CRGM.db = DatabaseManager.api;
  
  await DatabaseManager.init();
  await AuthManager.init();
  await ModuleManager.init();
}
```

### 2. `/src/js/core/auth.js`

**Agregado:**
```javascript
import DatabaseManager from './database.js';
```

**Cambios en métodos:**
- `checkTokenRey()`: Ahora usa `DatabaseManager.api.getAll('users')` directamente
- `login()`: Usa `DatabaseManager.api.getAll('users')`
- `validateToken()`: Usa `DatabaseManager.api.getAll('users')`
- `createUser()`: Usa `DatabaseManager.api.add('users', newUser)`

Esto elimina la dependencia circular con ModuleManager.

### 3. Archivo nuevo: `/CONFIG_MODULES.json`

Copiado desde la raíz a `/src/` para que el fetch funcione correctamente.

### 4. Script nuevo: `/iniciar.sh`

Script bash para inicio rápido con verificaciones automáticas.

---

## ✅ VERIFICACIÓN POST-CORRECCIÓN

### Checklist de Funcionamiento:

1. ✅ Git instalado
2. ✅ CONFIG_MODULES.json en ubicación correcta
3. ✅ Orden de inicialización corregido en app.js
4. ✅ Dependencias circulares eliminadas en auth.js
5. ✅ Script de inicio creado

### Flujo de Inicialización Correcto:

```
1. Cargar HTML + CSS
2. Ejecutar app.js
   ├─ Registrar módulos
   ├─ Exponer en window.CRGM (namespace global)
   ├─ Inicializar DatabaseManager
   ├─ Inicializar AuthManager (puede acceder a DatabaseManager)
   └─ Inicializar ModuleManager
3. Configurar UI
4. Verificar autenticación
5. ✓ App lista!
```

---

## 🔍 DEBUGGING - Si Aún Hay Problemas

### 1. Abrir DevTools (F12) → Console

Buscar mensajes de error:

**Error:** `Failed to load module`
- **Causa:** Servidor no está corriendo
- **Solución:** Ejecutar `./iniciar.sh` o `python3 -m http.server 8000`

**Error:** `CORS policy`
- **Causa:** Usando `file://` en lugar de `http://`
- **Solución:** Usar servidor HTTP local

**Error:** `404 Not Found: CONFIG_MODULES.json`
- **Causa:** Archivo no copiado
- **Solución:** `cp /home/crgm-unix/Desktop/CRGM-API/CONFIG_MODULES.json /home/crgm-unix/Desktop/CRGM-API/src/`

**Error:** `Cannot read property 'get' of null`
- **Causa:** window.CRGM.modules no inicializado
- **Solución:** Ya corregido en esta actualización

### 2. Verificar que el servidor esté corriendo

```bash
ps aux | grep python3 | grep 8000
```

Si aparece un proceso, el servidor está corriendo.

### 3. Verificar puerto

```bash
lsof -i :8000
```

Si está en uso por otro proceso, detenerlo:
```bash
pkill -f "python3 -m http.server 8000"
```

### 4. Prueba Simple

Abrir: `http://localhost:8000/test-simple.html`

Este archivo verifica:
- ✅ HTML carga correctamente
- ✅ IndexedDB disponible
- ✅ Service Worker soportado
- ✅ Fetch API funciona
- ✅ Servidor HTTP funcionando

---

## 📚 RECURSOS ADICIONALES

- **Documentación completa:** `/COMO_PROBAR.txt`
- **Arquitectura:** `/ARQUITECTURA_MAESTRA.md`
- **Checklist desarrollo:** `/CHECKLIST_DESARROLLO.md`
- **Inicio rápido:** `/src/INICIO_RAPIDO.md`

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Iniciar servidor con `./iniciar.sh`
2. ✅ Ingresar token: `CRGM2026`
3. ✅ Explorar módulos disponibles
4. 📝 Desarrollar módulos pendientes (Scanner, LOTO, etc.)

---

## 💡 NOTAS IMPORTANTES

- **SIEMPRE** usar servidor HTTP, nunca `file://`
- El puerto por defecto es 8000
- IndexedDB se limpia si cambias de puerto o dominio
- Service Worker cachea archivos (Ctrl+Shift+R para hard reload)

---

---

## 🪟 ACTUALIZACIÓN PARA WINDOWS (2026-02-10)

### ❌ Problema: Script iniciar.sh no funciona en Windows

**Síntoma:**
- El archivo `iniciar.sh` es un script Bash (Linux/Unix)
- Windows usa archivos `.bat` o `.cmd`

**Solución:**
Se creó `iniciar.bat` equivalente para Windows con las siguientes características:

✅ Verifica instalación de Python
✅ Detecta puerto 8000 en uso
✅ Inicia servidor HTTP automáticamente
✅ Abre navegador automáticamente
✅ Muestra instrucciones claras

**Uso:**
```
Doble clic en iniciar.bat
```

### ✅ Corrección de Dependencias Circulares

**Problema identificado:**
- `auth.js` usaba `window.CRGM.db.getAll()` 
- Esto creaba dependencia circular con el orden de inicialización

**Solución aplicada:**
- Agregado `import DatabaseManager from './database.js'` en auth.js
- Cambiado todas las llamadas de `window.CRGM.db.*` a `DatabaseManager.api.*`
- Esto elimina la dependencia del namespace global durante la inicialización

**Archivos modificados:**
- `/src/js/core/auth.js` - Importación directa de DatabaseManager

### 📄 Nueva Documentación

Se creó `INSTRUCCIONES_INICIO_WINDOWS.md` con:
- Guía paso a paso para Windows
- Solución de problemas específicos de Windows
- Comandos útiles para CMD/PowerShell
- Verificación con DevTools

---

**Estado Final:** ✅ TODOS LOS PROBLEMAS RESUELTOS (Linux + Windows)  
**Fecha de Resolución:** 2026-02-10  
**Versión:** 1.0.1
