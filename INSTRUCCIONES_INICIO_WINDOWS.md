# 🚀 Instrucciones de Inicio - CRGM-API (Windows)

## ✅ Solución al Error de Inicialización

El error "Error al inicializar la aplicación" ocurre porque los navegadores **no permiten módulos ES6** cuando se abre el archivo directamente con `file://`.

**Solución**: Usar un servidor HTTP local.

---

## 🎯 Método 1: Script Automático (RECOMENDADO)

### Paso 1: Hacer doble clic en `iniciar.bat`

El archivo `iniciar.bat` está en la raíz del proyecto. Simplemente haz doble clic y:

1. ✅ Verificará que Python esté instalado
2. ✅ Iniciará el servidor HTTP en puerto 8000
3. ✅ Abrirá automáticamente el navegador
4. ✅ Mostrará las instrucciones de acceso

### Paso 2: Ingresar el token

Cuando se abra el navegador, verás la pantalla de login:

- **Token por defecto**: `CRGM2026`
- **Usuario**: Administrador
- **Nivel**: 999 (Token Rey - acceso total)

### Paso 3: ¡Listo!

La aplicación debería cargar correctamente y mostrar el panel principal.

---

## 🔧 Método 2: Manual (Si el script no funciona)

### Paso 1: Abrir PowerShell o CMD

Presiona `Win + R`, escribe `cmd` y presiona Enter.

### Paso 2: Navegar al directorio src

```cmd
cd "c:\Users\robin\Documents\Antigravity Projects\CRGM-API\src"
```

### Paso 3: Iniciar el servidor

```cmd
python -m http.server 8000
```

**Nota**: Si `python` no funciona, intenta con `python3` o `py`:

```cmd
py -m http.server 8000
```

### Paso 4: Abrir el navegador

Abre Chrome, Edge o Firefox y visita:

- `http://localhost:8000`
- O también: `http://127.0.0.1:8000`

### Paso 5: Ingresar el token

Token: `CRGM2026`

---

## 🐛 Solución de Problemas

### Error: "Python no está instalado"

**Solución**: Instalar Python desde [python.org](https://www.python.org/downloads/)

Durante la instalación, **marca la casilla** "Add Python to PATH".

### Error: "Puerto 8000 ya en uso"

**Opción 1**: Detener el servidor existente
```cmd
netstat -ano | findstr :8000
taskkill /PID [número_del_proceso] /F
```

**Opción 2**: Usar otro puerto
```cmd
python -m http.server 8080
```
Luego accede a: `http://localhost:8080`

### Error: "Failed to load module"

**Causa**: El servidor no está corriendo o estás usando `file://`

**Solución**: Asegúrate de:
1. El servidor HTTP está corriendo (ver terminal)
2. Estás accediendo vía `http://localhost:8000` (NO abrir el archivo directamente)

### Error: "Token inválido"

**Causa**: La base de datos no se inicializó correctamente

**Solución**:
1. Abre DevTools (F12)
2. Ve a la pestaña "Application" → "IndexedDB"
3. Elimina la base de datos `crgm_industrial_db`
4. Recarga la página (F5)
5. El token por defecto se creará automáticamente

---

## 🔍 Verificación con DevTools

### Paso 1: Abrir DevTools

Presiona `F12` en el navegador.

### Paso 2: Ir a la pestaña "Console"

Deberías ver mensajes como:

```
🚀 CRGM-API Iniciando...
[SW] Registrado: http://localhost:8000/
[DB] Inicializando IndexedDB...
[DB] Creando estructura...
[DB] ✓ Base de datos lista
[AUTH] Inicializando...
[AUTH] Creando Token Rey...
[AUTH] Token Rey creado: CRGM2026
[AUTH] ✓ Sistema listo
[MODULES] Inicializando gestor modular...
[MODULES] Configuración cargada
[MODULES] ✓ Gestor listo
✓ CRGM-API Lista
```

### Paso 3: Verificar IndexedDB

1. Ve a la pestaña "Application"
2. Expande "IndexedDB" en el panel izquierdo
3. Deberías ver `crgm_industrial_db` con 5 stores:
   - assets
   - logs
   - inventory
   - users
   - config

---

## 📝 Comandos Útiles

### Ver si el servidor está corriendo

```cmd
netstat -ano | findstr :8000
```

### Detener el servidor

Presiona `Ctrl + C` en la terminal donde está corriendo.

O forzar cierre:
```cmd
taskkill /F /IM python.exe
```

### Limpiar caché del navegador

Presiona `Ctrl + Shift + Delete` y limpia:
- Caché de imágenes y archivos
- Datos de sitios web

---

## 🎯 Resumen Rápido

1. **Doble clic** en `iniciar.bat`
2. **Esperar** a que se abra el navegador
3. **Ingresar token**: `CRGM2026`
4. **¡Listo!**

---

## 📞 Soporte

Si el problema persiste:

1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Copia el mensaje de error completo
4. Reporta el problema con el error exacto

---

**Última actualización**: 10 Febrero 2026  
**Versión**: 1.0.0
