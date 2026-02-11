# ⚡ Prueba Rápida - CRGM-API

## 🎯 Objetivo
Verificar que la aplicación funciona correctamente después de las correcciones.

---

## ✅ PASO 1: Iniciar la Aplicación

### Opción A: Script Automático (Recomendado)
1. Haz **doble clic** en `iniciar.bat`
2. Espera a que se abra el navegador automáticamente

### Opción B: Manual
1. Abre CMD o PowerShell
2. Ejecuta:
   ```cmd
   cd "c:\Users\robin\Documents\Antigravity Projects\CRGM-API\src"
   python -m http.server 8000
   ```
3. Abre el navegador en: `http://localhost:8000`

---

## ✅ PASO 2: Verificar Pantalla de Login

Deberías ver:
- ✅ Fondo negro
- ✅ Texto en verde/blanco
- ✅ Modal de login con campo "Ingresa tu Token"
- ✅ Botón "Acceder"
- ❌ **NO** debe aparecer "Error al inicializar la aplicación"

---

## ✅ PASO 3: Abrir DevTools (F12)

### Verificar Console
Presiona `F12` y ve a la pestaña **Console**.

Deberías ver estos mensajes **SIN ERRORES**:

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
[MODULES] ✓ Registrado: core.database
[MODULES] ✓ Registrado: core.auth
[MODULES] ✓ Registrado: core.modules
[MODULES] ✓ Gestor listo
✓ CRGM-API Lista
```

### Verificar IndexedDB
1. Ve a la pestaña **Application**
2. En el panel izquierdo, expande **IndexedDB**
3. Deberías ver: `crgm_industrial_db`
4. Expándelo y verifica que existan estos stores:
   - ✅ assets
   - ✅ logs
   - ✅ inventory
   - ✅ users
   - ✅ config

5. Haz clic en **users** → deberías ver 1 registro:
   ```
   id: "user_rey"
   token: "CRGM2026"
   name: "Administrador"
   level: 999
   createdAt: [timestamp]
   ```

---

## ✅ PASO 4: Iniciar Sesión

1. En el campo de token, escribe: `CRGM2026`
2. Haz clic en **Acceder**

### Resultado Esperado:
- ✅ El modal de login desaparece
- ✅ Aparece el contenido principal
- ✅ En la esquina superior derecha: "Administrador (Lv 999)"
- ✅ Mensaje de bienvenida: "Bienvenido, Administrador!"

---

## ✅ PASO 5: Verificar Menú

1. Haz clic en el botón **☰** (hamburguesa) en la esquina superior izquierda
2. Deberías ver el menú lateral con estas opciones:
   - ✅ Inicio
   - ✅ Escanear
   - ✅ Activos
   - ✅ Inventario
   - ✅ LOTO Digital
   - ✅ Administración

---

## ✅ PASO 6: Probar Navegación

Haz clic en cada opción del menú y verifica que:
- ✅ El menú se cierra
- ✅ Cambia el contenido principal
- ✅ No hay errores en la consola

---

## ✅ PASO 7: Cerrar Sesión

1. Abre el menú (☰)
2. Haz clic en **Cerrar Sesión**
3. Confirma en el diálogo

### Resultado Esperado:
- ✅ Vuelve a aparecer el modal de login
- ✅ El campo de token está vacío
- ✅ La esquina superior derecha está vacía

---

## 🎉 PRUEBA EXITOSA

Si todos los pasos anteriores funcionaron correctamente:

✅ **La aplicación está funcionando perfectamente**

Puedes proceder a:
- Desarrollar nuevos módulos
- Agregar funcionalidades
- Personalizar la interfaz

---

## ❌ Si Algo Falló

### Error en PASO 2 (Pantalla de Login no aparece)
**Causa**: Servidor no está corriendo o estás usando `file://`

**Solución**:
1. Verifica que el servidor esté corriendo (debe haber una ventana de CMD abierta)
2. Asegúrate de acceder vía `http://localhost:8000` (NO abrir el archivo directamente)

### Error en PASO 3 (Errores en Console)
**Causa**: Archivos no actualizados o caché del navegador

**Solución**:
1. Presiona `Ctrl + Shift + R` (hard reload)
2. Si persiste, limpia el caché del navegador
3. Cierra y vuelve a abrir el navegador

### Error en PASO 3 (IndexedDB no se crea)
**Causa**: Navegador no soporta IndexedDB o está deshabilitado

**Solución**:
1. Usa Chrome, Edge o Firefox (versiones recientes)
2. Verifica que IndexedDB no esté deshabilitado en configuración

### Error en PASO 4 (Token inválido)
**Causa**: Base de datos no se inicializó correctamente

**Solución**:
1. Abre DevTools (F12) → Application → IndexedDB
2. Haz clic derecho en `crgm_industrial_db` → Delete database
3. Recarga la página (F5)
4. Intenta de nuevo con el token `CRGM2026`

---

## 📊 Checklist de Verificación

Marca cada item cuando lo hayas verificado:

- [ ] Servidor HTTP iniciado correctamente
- [ ] Pantalla de login aparece sin errores
- [ ] Console muestra mensajes de inicialización exitosa
- [ ] IndexedDB creada con 5 stores
- [ ] Usuario "Administrador" existe en store "users"
- [ ] Login con token CRGM2026 funciona
- [ ] Menú lateral se abre y cierra correctamente
- [ ] Navegación entre vistas funciona
- [ ] Cerrar sesión funciona correctamente
- [ ] No hay errores en la consola

---

## 🎯 Próximos Pasos

Una vez que la prueba sea exitosa:

1. **Explorar la aplicación**
   - Familiarízate con la interfaz
   - Prueba todas las opciones del menú

2. **Revisar la documentación**
   - `ARQUITECTURA_MAESTRA.md` - Estructura completa
   - `CHECKLIST_DESARROLLO.md` - Guía de desarrollo
   - `CONFIG_MODULES.json` - Configuración de módulos

3. **Desarrollar nuevos módulos**
   - Usa `MODULE_TEMPLATE.md` como plantilla
   - Sigue las convenciones establecidas

4. **Personalizar**
   - Modifica colores en `/src/css/industrial.css`
   - Agrega nuevos usuarios con diferentes niveles
   - Configura módulos adicionales

---

**Tiempo estimado de prueba**: 5-10 minutos  
**Última actualización**: 10 Febrero 2026  
**Versión**: 1.0.1
