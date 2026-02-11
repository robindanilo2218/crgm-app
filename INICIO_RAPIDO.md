# 🚀 INICIO RÁPIDO - CRGM-API

## 📋 Aplicación Lista para Usar

Ya tienes el **núcleo funcional de CRGM-API** completamente implementado.

---

## 🔧 Cómo Iniciar la Aplicación

### Paso 1: Abrir Terminal
```bash
cd /home/crgm-unix/Desktop/CRGM-API/src
```

### Paso 2: Iniciar Servidor Local
```bash
python3 -m http.server 8000
```

### Paso 3: Abrir Navegador
Visita: **http://localhost:8000**

---

## 🔑 Credenciales de Acceso

**Token por defecto**: `CRGM2026`  
**Nivel**: 999 (Token Rey - Administrador)

---

## ✅ Verificación del Sistema

Una vez que ingreses, verifica:

1. **Service Worker**
   - Abrir DevTools > Console
   - Debe mostrar: `[SW] Registrado`

2. **IndexedDB**
   - Abrir DevTools > Application > IndexedDB
   - Debe existir: `crgm_industrial_db`
   - Con stores: assets, logs, inventory, users, config

3. **Autenticación**
   - Ingresar token `CRGM2026`
   - Debe mostrar: "Bienvenido, Administrador!"
   - Badge superior debe mostrar: "Administrador (Lv 999)"

4. **Funcionamiento Offline**
   - DevTools > Network > Throttling > Offline
   - Recargar página
   - La app debe seguir funcionando

---

## 🎨 Interfaz

### Modo Oscuro Industrial
- Fondo negro con texto verde neón
- Diseño optimizado para pantallas de planta
- Botones grandes para uso con guantes

### Navegación
- **☰ Menú**: Abre el sidebar
- **Usuario Badge**: Muestra nivel de acceso
- **Secciones**:
  - Inicio
  - Escanear (pendiente)
  - Activos (pendiente)
  - Inventario (pendiente)
  - LOTO Digital (pendiente)
  - Administración

---

## 📊 Módulos Implementados

✅ **Base de Datos (IndexedDB)**
- 5 Object Stores configurados
- API completa (get, getAll, add, put, delete, clear)

✅ **Sistema de Autenticación**
- Login con tokens
- Persistencia de sesión
- Niveles de permisos (1, 10, 50, 999)
- Creación de usuarios

✅ **Gestor Modular**
- Carga dinámica de módulos
- Sistema de dependencias
- Configuración externa (CONFIG_MODULES.json)

✅ **PWA Offline-First**
- Service Worker activo
- Cache-First strategy
- Instalable en dispositivos móviles

✅ **UI Responsive**
- Modo oscuro industrial
- Sistema de notificaciones (toasts)
- Loading states
- Modal de login

---

## 🔧 Próximos Módulos a Desarrollar

Siguiendo MODULE_TEMPLATE.md, implementar:

1. **Scanner** (`src/js/modules/scanner.js`)
   - Integrar html5-qrcode
   - Acceso a cámara
   - Lectura de QR/códigos de barras

2. **LOTO Digital** (`src/js/modules/loto.js`)
   - Bloqueo de seguridad
   - Checklist obligatorio
   - Evidencia fotográfica

3. **Assets** (`src/js/modules/assets.js`)
   - Expediente digital
   - Historial de eventos
   - Geolocalización

4. **Inventory** (`src/js/modules/inventory.js`)
   - Kardex valorado
   - Control de entradas/salidas
   - Alertas de stock bajo

---

## 🐛 Troubleshooting

### Error: Service Worker no se registra
```bash
# Verificar que estás en localhost o HTTPS
# Limpiar cache: DevTools > Application > Clear storage
```

### Error: IndexedDB no se crea
```bash
# Verificar en Console si hay errores
# Probar en modo incógnito
```

### Error: Módulos no se cargan
```bash
# Verificar que estés usando un servidor HTTP
# NO abrir el archivo index.html directamente
```

---

## 📝 Comandos Útiles

### Verificar Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(r => 
  console.log('SW:', r.length > 0 ? 'ACTIVO' : 'INACTIVO')
);
```

### Ver Usuario Actual
```javascript
console.log(window.CRGM.auth.getCurrentUser());
```

### Listar Todos los Módulos
```javascript
console.log(window.CRGM.modules.api.getAll());
```

### Crear Nuevo Usuario
```javascript
await window.CRGM.auth.createUser({
  name: 'Técnico 1',
  level: 10
});
```

---

## 📦 Estructura de Archivos Creados

```
src/
├── index.html              ✅ HTML principal
├── manifest.json           ✅ Config PWA
├── sw.js                   ✅ Service Worker
├── css/
│   └── industrial.css      ✅ Estilos
├── js/
│   ├── app.js              ✅ Controlador principal
│   └── core/
│       ├── database.js     ✅ Gestor IndexedDB
│       ├── auth.js         ✅ Autenticación
│       └── modules.js      ✅ Gestor modular
├── assets/
│   └── icons/
│       ├── icon-192.png    ✅ Icono PWA
│       └── icon-512.png    ✅ Icono PWA
└── modules/                📁 (vacío, para futuros módulos)
```

---

## 🎯 Estado del Proyecto

**Completado**: Núcleo funcional (MVP Core)  
**Progreso**: 30% del sistema completo  
**Token por defecto**: CRGM2026  
**Tiempo de desarrollo**: ~2 horas  

---

## 📚 Documentación Adicional

- **ARQUITECTURA_MAESTRA.md** - 10 niveles, 100+ módulos
- **CHECKLIST_DESARROLLO.md** - 200+ puntos de verificación
- **MODULE_TEMPLATE.md** - Plantilla para nuevos módulos
- **CONFIG_MODULES.json** - Configuración de módulos
- **DESARROLLO_FASE1.md** - Guía completa del núcleo

---

## 🚀 Siguiente Fase

Una vez verificado que el núcleo funciona correctamente:

1. Revisar DESARROLLO_FASE1.md
2. Elegir el siguiente módulo a implementar
3. Seguir la plantilla MODULE_TEMPLATE.md
4. Registrar el módulo en CONFIG_MODULES.json

---

**Versión**: 1.0.0 (Núcleo)  
**Fecha**: 10 Febrero 2026  
**CRGM Industrial Solutions**
