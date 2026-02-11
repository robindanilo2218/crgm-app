# ✅ CHECKLIST ALGORÍTMICO DE DESARROLLO
## Sistema de Verificación Completo CRGM-API

**Versión**: 1.0.0  
**Fecha**: 10 Febrero 2026  
**Uso**: Verificar integridad y completitud del desarrollo

---

## 🎯 CÓMO USAR ESTE CHECKLIST

### Convenciones
- `[ ]` = No iniciado
- `[~]` = En progreso
- `[x]` = Completado
- `[!]` = Requiere atención/bloqueado
- `[*]` = Crítico para MVP

### Estados de Prioridad
- **P0** = Crítico (Sin esto no funciona)
- **P1** = Alta (Necesario para operación básica)
- **P2** = Media (Mejora significativa)
- **P3** = Baja (Nice to have)

---

## 📦 FASE 0: INFRAESTRUCTURA BASE (MVP)

### 0.1 Configuración del Proyecto [P0]
```
[ ] Crear carpeta src/
[ ] Crear carpeta src/js/modules/
[ ] Crear carpeta src/css/
[ ] Crear carpeta src/assets/
[ ] Crear carpeta src/lib/
[ ] Crear carpeta docs/
```

### 0.2 PWA Offline-First [P0*]
```
[*] Crear index.html con estructura básica
[*] Crear manifest.json con configuración de app
[*] Crear sw.js (Service Worker) con estrategia offline
[ ] Verificar que la app se instale en Android/iOS
[ ] Verificar funcionamiento sin internet
[ ] Prueba: Modo avión activado, app sigue funcionando
```

**Código de Verificación**:
```javascript
// En DevTools > Console
navigator.serviceWorker.getRegistrations().then(r => console.log('SW:', r.length > 0 ? 'OK' : 'FAIL'));
```

### 0.3 Base de Datos IndexedDB [P0*]
```
[*] Crear clase IndustrialDB en database.js
[*] Implementar método init() con version control
[*] Crear Object Store: assets
[*] Crear Object Store: logs
[*] Crear Object Store: inventory
[*] Crear Object Store: diagrams
[*] Crear Object Store: deltas
[ ] Crear Object Store: projects
[ ] Crear Object Store: users
[ ] Implementar índices secundarios
[ ] Implementar método de actualización de versión
```

**Verificación**:
```javascript
// En DevTools > Application > IndexedDB
// Debe existir: crgm_industrial_db
// Debe tener stores: assets, logs, inventory, diagrams, deltas
```

### 0.4 Sistema de Módulos [P0]
```
[ ] Implementar carga dinámica de módulos (ES6 Modules)
[ ] Verificar que app.js sea el controlador principal
[ ] Verificar que cada módulo exporte funciones correctamente
[ ] Implementar sistema de dependencias entre módulos
```

---

## 🔐 FASE 1: SEGURIDAD Y AUTENTICACIÓN

### 1.1 Sistema de Tokens [P0*]
```
[ ] Diseñar estructura de Token Rey
[ ] Implementar generación de tokens con crypto.subtle
[ ] Crear sistema de permisos por token
[ ] Implementar validación de tokens en cada operación crítica
[ ] Crear interfaz de gestión de tokens en Dashboard Rey
```

### 1.2 Ofuscación de Archivos [P1]
```
[ ] Implementar generador de nombres aleatorios
[ ] Crear diccionario de traducción (map_index.sys)
[ ] Implementar renombrado de archivos en almacenamiento
[ ] Verificar que archivos .json se guarden como .sys/.dll/.dat
```

**Test de Ofuscación**:
```javascript
// Guardar un proyecto
// Verificar en IndexedDB que el nombre sea aleatorio
// Verificar que solo la app pueda leerlo con el token correcto
```

### 1.3 Firma Digital [P1]
```
[ ] Implementar HMAC-SHA256 para validación
[ ] Agregar firma a cada Delta generado
[ ] Crear verificador de integridad en recepción
[ ] Rechazar automáticamente archivos sin firma válida
```

### 1.4 Semilla de Génesis [P1]
```
[ ] Generar par de llaves RSA para Token Rey
[ ] Crear código QR con llave maestra
[ ] Implementar generación de frase mnemónica BIP-39
[ ] Crear interfaz de recuperación con llave física
```

---

## 🎨 FASE 2: INTERFAZ DE USUARIO

### 2.1 Modo Oscuro Industrial [P0*]
```
[*] Crear industrial.css con variables de color
[*] Implementar paleta Negro/Verde/Rojo/Ámbar
[ ] Verificar contraste WCAG AAA (7:1)
[ ] Probar legibilidad bajo luz solar directa
[ ] Implementar toggle manual día/noche (opcional)
```

### 2.2 Componentes Reutilizables [P1]
```
[ ] Crear componente: Button (primario, secundario, peligro)
[ ] Crear componente: Modal (diálogos)
[ ] Crear componente: Toast (notificaciones)
[ ] Crear componente: ProgressBar
[ ] Crear componente: Card (para máquinas/repuestos)
```

### 2.3 Navegación [P0]
```
[ ] Implementar sistema de rutas (hash routing o History API)
[ ] Crear menú hamburguesa para móviles
[ ] Implementar breadcrumbs (navegación jerárquica)
[ ] Crear botón de "Volver" persistente
```

---

## 📹 FASE 3: ESCÁNER Y VISIÓN

### 3.1 Escáner QR/Código de Barras [P0*]
```
[*] Integrar librería html5-qrcode
[*] Implementar acceso a cámara trasera
[*] Crear interfaz de escaneo con marco verde
[*] Implementar callback de éxito con beep
[*] Implementar manejo de errores (sin cámara)
[ ] Agregar soporte para NFC (si hardware disponible)
```

**Verificación**:
```
[ ] Escanear QR de máquina → Abre expediente
[ ] Escanear QR de repuesto → Muestra stock
[ ] Escanear QR de Token → Inicia sesión
[ ] Modo offline: Escaneo funciona sin internet
```

### 3.2 Realidad Aumentada Básica [P2]
```
[ ] Implementar detección de puntos de anclaje
[ ] Crear sistema de etiquetas flotantes (Anchor)
[ ] Implementar Ghost Layer (comparación antes/después)
[ ] Crear editor de notas espaciales
[ ] Implementar persistencia de anotaciones AR
```

---

## 🔒 FASE 4: SEGURIDAD LOTO

### 4.1 Módulo LOTO Digital [P0*]
```
[*] Crear interfaz de bloqueo con checklist obligatorio
[*] Implementar validación de voltaje cero
[*] Implementar confirmación de candado físico
[*] Guardar estado en LocalStorage (persistencia crítica)
[*] Bloquear todas las funciones cuando LOTO activo
[ ] Implementar protocolo de desbloqueo con doble confirmación
[ ] Crear log de auditoría LOTO en IndexedDB
```

**Test Crítico**:
```
[ ] Aplicar LOTO → Cerrar app → Reabrir
    ✓ La pantalla de bloqueo debe seguir activa
[ ] Intentar acceder a otras funciones con LOTO activo
    ✓ Debe denegar acceso y mostrar advertencia
```

### 4.2 Evidencia Fotográfica [P1]
```
[ ] Implementar captura de foto del candado instalado
[ ] Convertir foto a Blob y guardar en IndexedDB
[ ] Comprimir imagen antes de guardar (max 500KB)
[ ] Mostrar foto en historial de bloqueos
```

---

## 📊 FASE 5: EDITOR DE DIAGRAMAS ELÉCTRICOS

### 5.1 Canvas SVG de 10 Columnas [P1*]
```
[ ] Crear grid de 10 columnas (150px c/u = 1500px)
[ ] Implementar zoom y pan del canvas
[ ] Crear sistema de capas (Potencia, Control, Referencias)
[ ] Implementar snap to grid (ajuste automático)
```

### 5.2 Librería de Símbolos IEC 60617 [P1]
```
[ ] Diseñar símbolos: Motor, Contactor, Disyuntor
[ ] Diseñar símbolos: Pulsadores (NO/NC)
[ ] Diseñar símbolos: Relés, Fusibles, Transformadores
[ ] Diseñar símbolos: PLC (Entradas/Salidas)
[ ] Implementar drag & drop de símbolos al canvas
```

### 5.3 Auto-Cableado Inteligente [P2]
```
[ ] Implementar detección de conexiones lógicas
[ ] Crear algoritmo de ruteo ortogonal (90 grados)
[ ] Implementar cable magnético (se pega a bornes)
[ ] Calcular automáticamente referencias cruzadas
```

### 5.4 Exportación PDF [P1]
```
[ ] Integrar librería jsPDF
[ ] Crear plantilla de cajetín profesional
[ ] Generar BOM automática desde componentes
[ ] Generar lista de cables desde conexiones
[ ] Exportar multi-página (un PDF con varias hojas)
```

---

## 🏭 FASE 6: GESTIÓN DE ACTIVOS

### 6.1 Expediente Digital [P0*]
```
[*] Crear interfaz de ficha técnica de máquina
[*] Implementar carga de historial desde IndexedDB
[*] Mostrar logs filtrados por ID de máquina
[ ] Agregar galería de fotos del activo
[ ] Implementar visor de manuales PDF embebido
```

### 6.2 Geolocalización [P1*]
```
[*] Implementar Geolocation API
[*] Capturar coordenadas GPS en cada evento
[*] Guardar coordenadas en logs con formato [lat, lon]
[ ] Mostrar mapa con ubicación del activo (opcional)
[ ] Calcular distancia entre técnico y máquina
```

**Test GPS**:
```javascript
navigator.geolocation.getCurrentPosition(
  pos => console.log('GPS OK:', pos.coords),
  err => console.log('GPS FAIL:', err)
);
```

### 6.3 Registro de Fallas [P0*]
```
[*] Crear formulario de reporte de fallas
[*] Implementar grabación por voz (Speech Recognition)
[ ] Agregar captura de foto de evidencia
[ ] Vincular consumo de repuestos al reporte
[ ] Calcular costo automático del evento
```

---

## 📦 FASE 7: INVENTARIO Y COSTOS

### 7.1 Kardex de Repuestos [P0*]
```
[*] Crear Object Store inventory en IndexedDB
[*] Implementar CRUD de repuestos
[*] Calcular valor total de inventario
[ ] Implementar búsqueda por nombre/código
[ ] Crear alertas de stock bajo
```

### 7.2 Consumo de Materiales [P0*]
```
[*] Implementar función consumePart()
[*] Restar stock automáticamente
[*] Registrar costo en log de máquina
[ ] Generar reporte de consumo por período
[ ] Calcular costo total por máquina
```

### 7.3 Punto de Reorden [P2]
```
[ ] Implementar algoritmo ROP = (d × L) + SS
[ ] Calcular consumo promedio diario
[ ] Generar alerta automática al llegar a ROP
[ ] Crear interfaz de órdenes de compra sugeridas
```

---

## 🔄 FASE 8: SINCRONIZACIÓN "ZAS"

### 8.1 Protocolo Visual (QR) [P1*]
```
[*] Integrar qrcode.js para generación
[*] Implementar broadcast() de datos
[*] Crear interfaz de transmisión full-screen
[*] Implementar processIncoming() para recepción
[ ] Agregar validación de firma en recepción
```

### 8.2 Protocolo P2P Local [P2]
```
[ ] Implementar WebRTC Data Channel
[ ] Crear handshake de dispositivos cercanos
[ ] Implementar transferencia de Deltas
[ ] Crear cola de sincronización automática
```

### 8.3 Protocolo Bluetooth [P3]
```
[ ] Implementar Web Bluetooth API
[ ] Crear servicio GATT personalizado
[ ] Implementar transferencia de archivos < 512 bytes
[ ] Manejar re-intentos en caso de fallo
```

### 8.4 Google Drive Sync [P1]
```
[ ] Integrar Google Drive API
[ ] Implementar OAuth2 para autenticación
[ ] Crear estructura de carpetas ofuscadas en Drive
[ ] Implementar subida/bajada de Deltas
[ ] Manejar conflictos de versiones
```

---

## 📈 FASE 9: ANÁLISIS Y REPORTES

### 9.1 Dashboard Rey [P1]
```
[ ] Crear vista ejecutiva con KPIs principales
[ ] Implementar organigrama desplegable
[ ] Mostrar mapa de calor de actividad
[ ] Crear panel de sincronización en tiempo real
[ ] Implementar filtros por fecha/área/técnico
```

### 9.2 Indicadores Lean [P2]
```
[ ] Implementar cálculo de OEE
[ ] Implementar cálculo de MTBF/MTTR
[ ] Crear gráficos de tendencia (Chart.js)
[ ] Implementar análisis Pareto
[ ] Calcular nivel Sigma (DPMO)
```

### 9.3 Reportes PDF Automáticos [P2]
```
[ ] Crear plantilla de reporte ejecutivo
[ ] Generar gráficos con Chart.js
[ ] Compilar datos de múltiples JSONs
[ ] Incluir fotos y evidencias
[ ] Enviar por email automático (opcional)
```

---

## 🛡️ FASE 10: RESPALDOS Y RECUPERACIÓN

### 10.1 Exportación Manual [P0*]
```
[ ] Crear clase BackupManager
[ ] Implementar exportData() → archivo .crgm.json
[ ] Forzar descarga a carpeta Descargas
[ ] Incluir metadata (versión, timestamp)
```

**Test de Exportación**:
```
[ ] Crear datos de prueba
[ ] Exportar backup
[ ] Verificar que archivo exista en Descargas
[ ] Verificar que sea JSON válido
```

### 10.2 Importación/Restauración [P0*]
```
[ ] Implementar importData() desde archivo
[ ] Validar estructura del backup
[ ] Confirmar antes de sobrescribir
[ ] Reconstruir todos los Object Stores
[ ] Recargar página después de importar
```

**Test de Recuperación**:
```
[ ] Exportar backup completo
[ ] Borrar IndexedDB manualmente (DevTools)
[ ] Importar backup
[ ] Verificar que todos los datos regresen
```

---

## 🧪 FASE 11: TESTING Y CALIDAD

### 11.1 Tests de Integridad [P0]
```
[ ] Verificar que Service Worker se registre
[ ] Verificar que IndexedDB se cree correctamente
[ ] Verificar que módulos se carguen sin errores
[ ] Verificar que app funcione sin internet
```

### 11.2 Tests de Seguridad [P1]
```
[ ] Intentar acceso sin token → debe denegar
[ ] Intentar modificar archivo ofuscado → debe detectar
[ ] Intentar sincronizar con firma inválida → debe rechazar
[ ] Verificar que LocalStorage no exponga datos sensibles
```

### 11.3 Tests de Performance [P2]
```
[ ] Medir tiempo de carga inicial (< 3s)
[ ] Medir tiempo de escaneo QR (< 1s)
[ ] Medir consumo de batería (< 5%/hora)
[ ] Verificar uso de RAM (< 100MB)
```

### 11.4 Tests de Compatibilidad [P1]
```
[ ] Probar en Chrome Android
[ ] Probar en Safari iOS
[ ] Probar en Chrome Desktop
[ ] Probar en Firefox
[ ] Verificar PWA instalable en todos
```

---

## 📱 FASE 12: OPTIMIZACIÓN MÓVIL

### 12.1 Responsive Design [P0]
```
[ ] Verificar viewport meta tag correcto
[ ] Diseño adaptable 320px - 1920px
[ ] Botones mínimo 44x44px (dedos)
[ ] Texto legible sin zoom (16px mínimo)
```

### 12.2 Optimización de Batería [P1]
```
[ ] Implementar frecuencia adaptativa de sync
[ ] Reducir FPS de cámara cuando batería < 20%
[ ] Deshabilitar animaciones en modo ahorro
[ ] Implementar throttling de GPS
```

### 12.3 Optimización de Almacenamiento [P1]
```
[ ] Comprimir imágenes antes de guardar
[ ] Implementar limpieza de logs antiguos (> 6 meses)
[ ] Usar MessagePack para JSONs grandes
[ ] Implementar límite de tamaño de DB (< 500MB)
```

---

## 🚀 FASE 13: DESPLIEGUE

### 13.1 Configuración de Producción [P0]
```
[ ] Minificar JavaScript (UglifyJS/Terser)
[ ] Minificar CSS
[ ] Optimizar imágenes (WebP)
[ ] Configurar HTTPS obligatorio
[ ] Actualizar versión en manifest.json
```

### 13.2 Hosting [P0]
```
[ ] Subir a GitHub Pages / Netlify / Vercel
[ ] Configurar dominio personalizado
[ ] Configurar SSL/TLS
[ ] Verificar que PWA sea instalable desde producción
```

### 13.3 Documentación [P1]
```
[ ] Completar README.md
[ ] Crear guía de usuario (USER_GUIDE.md)
[ ] Documentar API interna (API_REFERENCE.md)
[ ] Crear video tutorial de 5 minutos
```

---

## 🎓 CAPACITACIÓN Y ADOPCIÓN

### 14.1 Material de Entrenamiento [P1]
```
[ ] Crear manual impreso de 1 página
[ ] Grabar video: "Cómo escanear una máquina"
[ ] Grabar video: "Cómo aplicar LOTO"
[ ] Grabar video: "Cómo reportar falla"
[ ] Crear FAQ (Preguntas Frecuentes)
```

### 14.2 Piloto con Técnicos [P0]
```
[ ] Seleccionar 2-3 técnicos para prueba
[ ] Instalar app en sus dispositivos
[ ] Realizar simulacro completo
[ ] Recolectar feedback
[ ] Iterar según comentarios
```

---

## ✅ CRITERIOS DE ACEPTACIÓN FINAL

### Para declarar el MVP completo, verificar:

**Funcionalidad Básica**
```
[*] La app se instala en Android como PWA
[*] Funciona completamente sin internet
[*] Se puede escanear QR y ver historial de máquina
[*] Se puede aplicar LOTO y este persiste
[*] Se puede reportar falla con GPS
[*] Se puede consumir repuesto del inventario
[*] Se puede exportar backup a archivo físico
```

**Sincronización**
```
[ ] Se puede generar QR de datos
[ ] Otro dispositivo puede leer y procesar el QR
[ ] Los cambios se reflejan en ambos dispositivos
```

**Seguridad**
```
[ ] Los archivos están ofuscados
[ ] El Token Rey es necesario para operaciones críticas
[ ] Los datos sobreviven a "Borrar Caché"
```

**Performance**
```
[ ] Carga inicial < 3 segundos
[ ] Escaneo QR < 1 segundo
[ ] Sin lag en interfaz
```

---

## 📊 MÉTRICAS DE ÉXITO

Al completar el desarrollo, medir:

- **Tiempo de adopción**: < 1 día para que un técnico use la app solo
- **Errores por turno**: < 1 error reportado por día
- **Uptime**: 99.9% (funciona incluso sin internet)
- **Satisfacción**: > 8/10 en encuesta a técnicos
- **ROI**: Recuperar inversión en < 6 meses

---

## 🔧 HERRAMIENTAS RECOMENDADAS

### Desarrollo
- **Editor**: VS Code con extensiones (Live Server, ESLint)
- **Testing**: Chrome DevTools, Lighthouse
- **Versionado**: Git + GitHub

### Testing
- **PWA**: Lighthouse Audit (score > 90)
- **Móvil**: Chrome Remote Debugging
- **Offline**: Network Throttling en DevTools

### Despliegue
- **Hosting**: GitHub Pages (gratis) o Netlify
- **CI/CD**: GitHub Actions para deploy automático

---

**Última Actualización**: 10 Febrero 2026  
**Revisión**: v1.0.0  
**Estado General**: [ ] MVP Completado

