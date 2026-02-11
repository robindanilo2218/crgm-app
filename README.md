# 🏭 CRGM-API - Sistema Operativo Industrial

## 🎯 Visión General

**CRGM-API** es un sistema completo de gestión industrial diseñado para funcionar en entornos sin conexión a internet, con sincronización P2P y seguridad soberana. Combina editor de diagramas eléctricos, gestión de mantenimiento, inventario valorado, producción OEE y realidad aumentada en una sola aplicación PWA.

### 🚀 Características Principales

- **Offline-First**: Funciona completamente sin internet
- **Sincronización "Zas"**: Transferencia P2P instantánea entre dispositivos
- **Editor de Diagramas**: Canvas SVG de 10 columnas (Estándar Europeo IEC 60617)
- **LOTO Digital**: Seguridad lockout/tagout con evidencia fotográfica y GPS
- **Inventario Valorado**: Control milimétrico de costos por máquina
- **Realidad Aumentada**: Etiquetas flotantes y comparación antes/después
- **Resiliencia Total**: Múltiples capas de respaldo anti-borrado

---

## 📋 Documentación

### Documentos Principales

- **[ARQUITECTURA_MAESTRA.md](./ARQUITECTURA_MAESTRA.md)** - Índice completo de módulos y estructura del sistema
- **[CHECKLIST_DESARROLLO.md](./CHECKLIST_DESARROLLO.md)** - Verificación algorítmica de desarrollo
- **[CRGM API DEV.txt](./CRGM%20API%20DEV.txt)** - Conversación completa de diseño

### Documentación Técnica (Pendiente)
- `docs/USER_GUIDE.md` - Guía de usuario
- `docs/API_REFERENCE.md` - Referencia de la API interna
- `docs/DEPLOYMENT_GUIDE.md` - Guía de despliegue

---

## 🗂️ Estructura del Proyecto

```
CRGM-API/
│
├── 📄 README.md                    # Este archivo
├── 📄 ARQUITECTURA_MAESTRA.md      # Índice maestro completo
├── 📄 CHECKLIST_DESARROLLO.md      # Checklist algorítmico
├── 📄 CRGM API DEV.txt             # Documento de diseño original
│
├── 📁 Diagramas Electricos/        # PDFs de referencia (Fosber)
│
├── 📁 Modulos/                     # Módulos existentes
│   ├── SMED/                       # Aplicación SMED Analyzer Pro
│   └── Tools/                      # Herramientas varias
│
└── 📁 src/                         # Código fuente (A crear)
    ├── index.html
    ├── manifest.json
    ├── sw.js
    ├── css/
    ├── js/
    │   ├── app.js
    │   ├── database.js
    │   └── modules/
    ├── assets/
    └── lib/
```

---

## 🚦 Estado del Proyecto

### ✅ Fase de Diseño: COMPLETADA
- [x] Análisis de requisitos completo
- [x] Arquitectura definida (10 niveles, 100+ módulos)
- [x] Estructura de archivos diseñada
- [x] Checklist algorítmico creado
- [x] Documentación técnica inicial

### 🔄 Fase de Desarrollo: PENDIENTE
- [ ] Configuración inicial del proyecto
- [ ] Implementación del MVP (Módulos críticos P0)
- [ ] Testing y optimización
- [ ] Despliegue en producción

**Progreso Global**: 20% (Diseño completo, desarrollo pendiente)

---

## 🎯 MVP (Producto Mínimo Viable)

### Funcionalidades Críticas (P0)

1. **PWA Offline-First** 
   - Service Worker configurado
   - Funcionamiento sin internet

2. **Base de Datos Local**
   - IndexedDB con 5 stores principales
   - Sistema de respaldos manual

3. **Escáner QR**
   - Lectura de códigos de máquinas/repuestos
   - Activación de cámara

4. **LOTO Digital**
   - Bloqueo de seguridad persistente
   - Checklist obligatorio

5. **Gestión de Activos**
   - Expediente digital de máquinas
   - Registro de fallas con GPS

6. **Inventario Valorado**
   - Kardex de repuestos con costos
   - Consumo automático al reportar fallas

7. **Sincronización "Zas"**
   - Generación de QR con datos
   - Lectura y procesamiento de paquetes

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **SVG** para diagramas vectoriales
- **Canvas API** para edición gráfica

### Almacenamiento
- **IndexedDB** - Base de datos principal
- **LocalStorage** - Datos críticos mínimos
- **File System Access API** - Exportación de respaldos

### Sincronización
- **WebRTC** - Comunicación P2P
- **Web Bluetooth API** - Transferencia por proximidad
- **Google Drive API** - Sincronización en nube (opcional)

### Seguridad
- **Web Crypto API** - Cifrado y firmas digitales
- **HMAC-SHA256** - Validación de integridad

### Realidad Aumentada
- **getUserMedia** - Acceso a cámara
- **WebGL** - Renderizado 3D
- **Geolocation API** - GPS

### PWA
- **Service Workers** - Funcionamiento offline
- **Cache API** - Almacenamiento de recursos
- **Web App Manifest** - Instalación nativa

---

## 📱 Requisitos del Sistema

### Hardware Mínimo
- **Procesador**: Dual-core 1.5 GHz
- **RAM**: 2 GB
- **Almacenamiento**: 500 MB libres
- **Cámara**: Trasera con autofocus
- **Sensores**: GPS, Acelerómetro, Giroscopio

### Software
- **Navegadores Soportados**:
  - Chrome/Edge 90+ (Recomendado)
  - Safari 14+ (iOS)
  - Firefox 88+
  
- **Sistemas Operativos**:
  - Android 8.0+
  - iOS 14+
  - Windows 10+
  - macOS 10.15+
  - Linux (cualquier distribución moderna)

---

## 🚀 Inicio Rápido

### Instalación para Desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/CRGM-API.git
cd CRGM-API

# 2. Crear estructura de desarrollo
mkdir -p src/{css,js/modules,assets/{icons,sounds},lib}

# 3. Iniciar servidor local (Python)
cd src
python3 -m http.server 8000

# 4. Abrir en navegador
# Visita: http://localhost:8000
```

### Instalación para Producción

Ver guía detallada en `docs/DEPLOYMENT_GUIDE.md` (pendiente de crear)

---

## 🔐 Seguridad

### Modelo de Seguridad

1. **Ofuscación de Archivos**
   - Los archivos .json se guardan con nombres aleatorios (.sys, .dll, .dat)
   - Solo la app puede traducir los nombres reales

2. **Firma Digital**
   - Cada archivo incluye firma HMAC-SHA256
   - Validación automática en cada operación

3. **Sistema de Tokens**
   - Token Rey: Control total (administrador)
   - Tokens Nodos: Permisos limitados (técnicos)
   - Tokens Temporales: Acceso por jornada

4. **Semilla de Génesis**
   - Llave maestra física (QR + Frase BIP-39)
   - Recuperación total en caso de desastre

---

## 📊 Filosofía de Diseño

### "Estandarización Brutal"
Todos los dispositivos ven la misma información al mismo tiempo. No hay puntos ciegos financieros u operativos.

### "Offline-First"
Internet es opcional, no obligatorio. Cada dispositivo es un servidor autónomo.

### "Zas" (Sincronización Instantánea)
Los datos saltan entre dispositivos mediante:
1. Acercamiento físico (Bluetooth/NFC)
2. Red local (Wi-Fi sin internet)
3. Nube (cuando hay conexión)
4. Transferencia manual (USB/QR)

### "Presupuesto Milimétrico"
Cada centavo, tornillo y minuto es registrado con trazabilidad GPS y timestamp.

---

## 🎨 Interfaz

### Modo Oscuro Industrial
- **Fondo**: Negro puro (#000000)
- **Texto**: Gris platino (#E0E0E0)
- **Acentos**:
  - 🟢 Verde neón: Éxito/Disponible (#00FF41)
  - 🔴 Rojo: Peligro/Bloqueo (#FF3300)
  - 🟡 Ámbar: Advertencia (#FF9900)
  - 🔵 Cyan: Información (#00DDFF)

### Principios de UX
- Botones grandes (≥44px) para uso con guantes
- Contraste alto para luz solar directa
- Fuente monoespaciada para datos técnicos
- Vibración háptica para confirmaciones

---

## 🤝 Contribución

Este es un proyecto propietario de **CRGM Industrial Solutions**. 

Para consultas o colaboraciones:
- **Email**: smed@crgm.app
- **Web**: https://crgm.app

---

## 📜 Licencia

**Propietaria** - Todos los derechos reservados © 2026 CRGM Industrial Solutions

Este software es de código cerrado. Uso no autorizado está prohibido.

---

## 🗺️ Roadmap

### Fase 1: MVP (Q1 2026)
- [x] Diseño y arquitectura
- [ ] Desarrollo de módulos P0
- [ ] Testing inicial
- [ ] Despliegue alpha

### Fase 2: Producción (Q2 2026)
- [ ] Implementación de módulos P1
- [ ] Testing exhaustivo
- [ ] Capacitación de técnicos
- [ ] Despliegue en producción

### Fase 3: Expansión (Q3-Q4 2026)
- [ ] Módulos P2 (Realidad Aumentada completa)
- [ ] Integración con sistemas ERP existentes
- [ ] Analítica avanzada Six Sigma
- [ ] Multi-planta

---

## 🏆 Objetivos de Negocio

### Métricas de Éxito
- **Adopción**: < 1 día para técnico autónomo
- **Errores**: < 1 error por turno
- **Uptime**: 99.9% (incluso sin internet)
- **Satisfacción**: > 8/10 en encuestas
- **ROI**: Recuperación en < 6 meses

### Impacto Esperado
- ⬇️ Reducción 40% en tiempos de mantenimiento
- ⬇️ Reducción 60% en errores de cableado
- ⬆️ Aumento 25% en OEE (Eficiencia de Equipos)
- 💰 Ahorro anual estimado: $50,000+ USD

---

## 📞 Soporte

Para soporte técnico o consultas:

- **Documentación**: Ver carpeta `docs/`
- **Issues**: Reportar en sistema interno
- **Email**: soporte@crgm.app
- **Horario**: Lunes a Viernes, 8:00 - 17:00 (GMT-6)

---

## 🙏 Agradecimientos

Proyecto inspirado en los estándares industriales de:
- **Fosber** (Diagramas eléctricos IEC)
- **Lean Manufacturing** (Metodologías Kaizen, SMED)
- **Six Sigma** (Control estadístico de procesos)

---

**Desarrollado con ⚡ en Guatemala**  
**Versión**: 1.0.0 (Diseño)  
**Última actualización**: 10 Febrero 2026
