# 📐 PLAN ALGORÍTMICO - EDITOR DE DIAGRAMAS ELÉCTRICOS
## Análisis de Diagramas Profesionales Fosber (IEC 750 / CEI 3-34)

**Fecha de Análisis:** 11/02/2026  
**Documentos de Referencia:**
- 4607COM17310_ASPH(1) single preheater.pdf
- 4607COM17289_ARS4-Rotary shear.pdf
- 4607COM17293_ATR4-TERMINAL.pdf

---

## ✅ VERIFICACIÓN DE CAPACIDADES ACTUALES

### ✓ YA IMPLEMENTADO
1. **Grid de 10 columnas** ✓
2. **Componentes IEC estándar** ✓ (35 tipos de componentes)
3. **Sistema multi-página** ✓
4. **Cajetín IEC profesional** ✓
5. **Exportación CSV** ✓
6. **Referencias cruzadas** ✓
7. **Modos de trabajo** ✓ (Edición, Revisión, Finalizado)
8. **Undo/Redo** ✓
9. **Auto-conexión vertical** ✓
10. **Inspector de propiedades** ✓

### ❌ FALTA IMPLEMENTAR (Detectado en diagramas)

#### 🔴 CRÍTICO - Barras Horizontales de Alimentación
Los diagramas profesionales muestran **barras horizontales** que atraviesan todo el ancho del diagrama:
- **L1, L2, L3** (líneas trifásicas) - Color negro/marrón
- **PE0** (tierra) - Color amarillo/verde
- **X0.0** (0V común) - Color azul
- **X0.1** (+24V común) - Color rojo/naranja
- **X0.2, X0.3** (tensiones especiales)

**Problema:** Actualmente solo se soportan conexiones verticales punto a punto.

#### 🟡 IMPORTANTE - Componentes con Múltiples Terminales
Ejemplo: Variador con terminales L1, L2, L3, U, V, W, PE, DC+, DC-, BR+, BR-
**Problema:** Actualmente componentes solo tienen terminales top/bottom genéricos.

#### 🟡 IMPORTANTE - Etiquetas de Cable Avanzadas
Los diagramas muestran etiquetas en cables con:
- Número de página origen/destino
- Referencias cruzadas (ej: "/5.2" = va a página 5 columna 2)
- Código de cable (ej: "-W1", "-W800")

#### 🟢 DESEABLE - Black Boxes Redimensionables
Componentes complejos como PLC, VFD, que ocupan múltiples celdas.

---

## 🎯 PLAN DE IMPLEMENTACIÓN ALGORÍTMICA

### FASE 1: SISTEMA DE BARRAS HORIZONTALES (BUSBARS)

#### Estructura de Datos
```javascript
const HORIZONTAL_BUSBARS = {
  power_l1: { 
    name: 'L1', 
    color: '#000000', 
    row: 0, // Fila especial (antes de la 1)
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK' // Black
  },
  power_l2: { 
    name: 'L2', 
    color: '#000000', 
    row: 0, 
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK'
  },
  power_l3: { 
    name: 'L3', 
    color: '#000000', 
    row: 0,
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK'
  },
  ground_pe: { 
    name: 'PE0', 
    color: '#00aa00', 
    row: 0,
    voltage: 'GND',
    section: '16mm²',
    wireType: 'GNYE' // Green/Yellow
  },
  common_0v: { 
    name: 'X0.0', 
    color: '#0066ff', 
    row: 0,
    voltage: '0VDC',
    section: '2.5mm²',
    wireType: 'BU' // Blue
  },
  common_24v: { 
    name: 'X0.1', 
    color: '#ff6600', 
    row: 0,
    voltage: '+24VDC',
    section: '2.5mm²',
    wireType: 'RD' // Red
  }
};
```

#### Algoritmo de Renderizado
```
FUNCIÓN dibujarBarrasHorizontales(ctx, canvasWidth):
  PARA cada barra EN HORIZONTAL_BUSBARS:
    y = calcularPosiciónY(barra.row)
    
    // Dibujar línea horizontal gruesa
    ctx.strokeStyle = barra.color
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
    
    // Etiqueta cada 2 columnas
    PARA col = 0 HASTA COLS CON PASO 2:
      x = col * CELL_W + CELL_W/2
      ctx.fillStyle = barra.color
      ctx.font = 'bold 11px Courier New'
      ctx.fillText(barra.name, x, y - 5)
      
      // Punto de conexión
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2*PI)
      ctx.fill()
    FIN PARA
  FIN PARA
FIN FUNCIÓN
```

#### Sistema de Conexión a Barras
```
ESTRUCTURA ConexiónBarra:
  componentId: string
  busbarId: string (ej: 'power_l1', 'common_24v')
  terminal: string (ej: 'L1', 'X1', '+')
  column: number // Columna donde se conecta
  
FUNCIÓN conectarABarra(componente, busbar, terminal, columna):
  conexión = {
    id: generarID(),
    from: busbar.id,
    to: componente.id,
    fromTerminal: busbar.name,
    toTerminal: terminal,
    column: columna,
    tipo: 'busbar-to-component'
  }
  
  this.busbarConnections.push(conexión)
  
  // Renderizar línea vertical desde barra al componente
  DIBUJAR línea vertical desde (columna, busbar.row) a (componente.col, componente.row)
FIN FUNCIÓN
```

---

### FASE 2: COMPONENTES MULTI-TERMINAL

#### Definición Extendida de Componentes
```javascript
const COMPONENT_TERMINAL_SCHEMA = {
  vfd: {
    terminals: {
      input: {
        L1: { side: 'top', offset: -0.3, label: 'L1' },
        L2: { side: 'top', offset: 0, label: 'L2' },
        L3: { side: 'top', offset: 0.3, label: 'L3' },
        PE1: { side: 'top', offset: 0.45, label: 'PE' }
      },
      output: {
        U: { side: 'bottom', offset: -0.3, label: 'U' },
        V: { side: 'bottom', offset: 0, label: 'V' },
        W: { side: 'bottom', offset: 0.3, label: 'W' },
        PE2: { side: 'bottom', offset: 0.45, label: 'PE' }
      },
      control: {
        'DC+': { side: 'right', offset: -0.2, label: 'DC+' },
        'DC-': { side: 'right', offset: 0, label: 'DC-' },
        'BR+': { side: 'right', offset: 0.2, label: 'BR+' },
        'BR-': { side: 'right', offset: 0.4, label: 'BR-' }
      }
    }
  }
};
```

#### Algoritmo de Dibujo de Terminales
```
FUNCIÓN dibujarTerminales(ctx, componente, x, y, w, h):
  def = IEC_COMPONENTS[componente.type]
  schema = COMPONENT_TERMINAL_SCHEMA[componente.type]
  
  SI schema EXISTE:
    PARA cada grupo EN schema.terminals:
      PARA cada terminal EN grupo:
        posición = calcularPosiciónTerminal(terminal, x, y, w, h)
        
        // Dibujar punto de conexión
        ctx.fillStyle = terminal.color || '#00ff41'
        ctx.beginPath()
        ctx.arc(posición.x, posición.y, 3, 0, 2*PI)
        ctx.fill()
        
        // Etiqueta del terminal
        ctx.font = '8px Courier New'
        ctx.fillText(terminal.label, posición.x + 5, posición.y)
      FIN PARA
    FIN PARA
  FIN SI
FIN FUNCIÓN

FUNCIÓN calcularPosiciónTerminal(terminal, x, y, w, h):
  SEGÚN terminal.side:
    CASO 'top':
      RETORNAR { x: x + w/2 + (w * terminal.offset), y: y + 8 }
    CASO 'bottom':
      RETORNAR { x: x + w/2 + (w * terminal.offset), y: y + h - 8 }
    CASO 'left':
      RETORNAR { x: x + 8, y: y + h/2 + (h * terminal.offset) }
    CASO 'right':
      RETORNAR { x: x + w - 8, y: y + h/2 + (h * terminal.offset) }
  FIN SEGÚN
FIN FUNCIÓN
```

---

### FASE 3: COMPONENTES BLACK BOX REDIMENSIONABLES

#### Clase BlackBoxComponent
```javascript
class BlackBoxComponent {
  constructor(id, label, col, row, width, height) {
    this.id = id;
    this.type = 'blackbox';
    this.label = label;
    this.col = col;
    this.row = row;
    this.width = width;  // Número de celdas horizontales
    this.height = height; // Número de celdas verticales
    this.terminals = [];
    this.internalElements = []; // Elementos dibujados dentro
  }
  
  addTerminal(name, side, position, label) {
    this.terminals.push({
      name: name,
      side: side,      // 'top', 'bottom', 'left', 'right'
      position: position, // 0-1 (porcentaje del lado)
      label: label
    });
  }
  
  occupiesCel<br>(col, row) {
    return col >= this.col && 
           col < this.col + this.width &&
           row >= this.row && 
           row < this.row + this.height;
  }
}
```

#### Algoritmo de Renderizado BlackBox
```
FUNCIÓN dibujarBlackBox(ctx, component, cellW, cellH):
  x = component.col * cellW
  y = component.row * cellH
  w = component.width * cellW
  h = component.height * cellH
  
  // Fondo semi-transparente
  ctx.fillStyle = 'rgba(30, 30, 40, 0.9)'
  ctx.fillRect(x, y, w, h)
  
  // Borde grueso
  ctx.strokeStyle = component.color || '#00ff41'
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, w, h)
  
  // Título centrado
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(component.label, x + w/2, y + 20)
  
  // Dibujar terminales
  PARA cada terminal EN component.terminals:
    pos = calcularPosiciónTerminalBlackBox(terminal, x, y, w, h)
    
    // Punto de conexión
    ctx.fillStyle = '#00ff41'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 4, 0, 2*PI)
    ctx.fill()
    
    // Etiqueta terminal
    ctx.fillStyle = '#e0e0e0'
    ctx.font = '9px Courier New'
    ctx.fillText(terminal.label, pos.x + 8, pos.y + 4)
  FIN PARA
  
  // Elementos internos (slots, LEDs, etc.)
  PARA cada elemento EN component.internalElements:
    dibujarElementoInterno(ctx, elemento, x, y, w, h)
  FIN PARA
FIN FUNCIÓN
```

#### Ejemplo: PLC de 8 entradas/salidas
```javascript
// Crear PLC como BlackBox
const plc = new BlackBoxComponent('PLC1', 'PLC 1769-L35E', 3, 5, 3, 4);

// Agregar terminales de alimentación
plc.addTerminal('V+', 'top', 0.2, '+24V');
plc.addTerminal('V-', 'top', 0.3, '0V');

// Agregar 8 entradas digitales lado izquierdo
for (let i = 0; i < 8; i++) {
  plc.addTerminal(`DI${i}`, 'left', 0.2 + (i * 0.08), `IN${i}`);
}

// Agregar 8 salidas digitales lado derecho
for (let i = 0; i < 8; i++) {
  plc.addTerminal(`DO${i}`, 'right', 0.2 + (i * 0.08), `OUT${i}`);
}

// Elementos internos decorativos
plc.internalElements = [
  { type: 'led', x: 0.1, y: 0.15, color: '#00ff00', label: 'RUN' },
  { type: 'led', x: 0.3, y: 0.15, color: '#ffff00', label: 'I/O' },
  { type: 'led', x: 0.5, y: 0.15, color: '#0088ff', label: 'NET' }
];
```

---

### FASE 4: SISTEMA DE CABLEADO AVANZADO

#### Estructura de Cable Completa
```javascript
const ADVANCED_WIRE = {
  id: 'w_001',
  from: 'QF1',
  fromTerminal: 'L1',
  to: 'KM1',
  toTerminal: 'L1',
  
  // Propiedades eléctricas
  section: '2.5',        // mm²
  awg: '14',             // Calibre AWG
  color: 'Negro',
  colorCode: 'BK',       // Código IEC
  cableType: 'H07V-K',
  length: '2.5',         // metros
  manufacturer: 'TECNIFLEX',
  partNumber: '31051266',
  
  // Referencias cruzadas
  cableLabel: '-W1',     // Etiqueta única del cable
  originPage: 3,
  originCol: 5,
  destPage: 3,
  destCol: 5,
  crossRef: '/3.5',      // Referencia en formato IEC
  
  // Propiedades de ruta
  routeType: 'vertical' | 'horizontal' | 'orthogonal' | 'busbar',
  waypoints: [           // Puntos intermedios para rutas complejas
    { x: 100, y: 200 },
    { x: 150, y: 200 }
  ],
  
  // Conducto
  conduitSize: 'M16x1.5',
  conduitType: 'Ghiera'
};
```

#### Algoritmo de Ruteo de Cables
```
FUNCIÓN rutearCable(origen, destino, tipoCable):
  SI origen.col == destino.col:
    // Ruta vertical simple
    RETORNAR rutaVertical(origen, destino)
    
  SINO SI origen.row == destino.row:
    // Ruta horizontal simple
    RETORNAR rutaHorizontal(origen, destino)
    
  SINO:
    // Ruta ortogonal (esquinas de 90°)
    RETORNAR rutaOrtogonal(origen, destino)
  FIN SI
FIN FUNCIÓN

FUNCIÓN rutaOrtogonal(origen, destino):
  waypoints = []
  
  // Salir verticalmente del origen
  puntoMedio = {
    x: origen.x,
    y: (origen.y + destino.y) / 2
  }
  waypoints.push(puntoMedio)
  
  // Moverse horizontalmente
  puntoEsquina = {
    x: destino.x,
    y: puntoMedio.y
  }
  waypoints.push(puntoEsquina)
  
  // Entrar verticalmente al destino
  // (ya está en destino.x, destino.y)
  
  RETORNAR {
    type: 'orthogonal',
    points: [origen, ...waypoints, destino],
    cornerRadius: 5 // Radio de esquinas redondeadas
  }
FIN FUNCIÓN
```

#### Dibujo de Cable con Etiquetas
```
FUNCIÓN dibujarCableConEtiquetas(ctx, cable, ruta):
  // Dibujar trazado del cable
  ctx.strokeStyle = obtenerColorCable(cable.colorCode)
  ctx.lineWidth = 2.5
  ctx.setLineDash([])
  
  ctx.beginPath()
  ctx.moveTo(ruta.points[0].x, ruta.points[0].y)
  
  PARA i = 1 HASTA ruta.points.length:
    SI ruta.cornerRadius > 0 Y esEsquina(i):
      dibujarEsquinaRedondeada(ctx, ruta.points[i-1], ruta.points[i], ruta.points[i+1], ruta.cornerRadius)
    SINO:
      ctx.lineTo(ruta.points[i].x, ruta.points[i].y)
    FIN SI
  FIN PARA
  
  ctx.stroke()
  
  // Dibujar etiquetas en medio del cable
  puntoMedio = calcularPuntoMedio(ruta)
  
  // Etiqueta principal (código de cable)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(puntoMedio.x - 20, puntoMedio.y - 10, 40, 20)
  ctx.strokeStyle = '#00ff41'
  ctx.strokeRect(puntoMedio.x - 20, puntoMedio.y - 10, 40, 20)
  
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 9px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(cable.cableLabel, puntoMedio.x, puntoMedio.y)
  
  // Etiqueta secundaria (sección y color)
  ctx.font = '7px Courier New'
  ctx.fillText(`${cable.section}mm² ${cable.colorCode}`, puntoMedio.x, puntoMedio.y + 10)
  
  // Referencias cruzadas si aplica
  SI cable.crossRef:
    ctx.fillStyle = '#ffaa00'
    ctx.fillText(cable.crossRef, puntoMedio.x + 25, puntoMedio.y)
  FIN SI
FIN FUNCIÓN
```

---

### FASE 5: MANIPULACIÓN DE OBJETOS Y PROPIEDADES

#### Sistema de Selección y Edición
```
OBJETO EditorState:
  selectedObjects: Array<ComponentID>  // Selección múltiple
  clipboard: Array<Component>
  dragMode: 'move' | 'resize' | 'connect' | null
  resizeHandle: 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b' | null
  
FUNCIÓN manejarClick(event, x, y):
  col = floor(x / CELL_W)
  row = floor(y / CELL_H)
  
  // 1. ¿Click en barra horizontal?
  busbar = detectarClickEnBarra(x, y)
  SI busbar:
    mostrarMenuBarr(busbar, x, y)
    RETORNAR
  FIN SI
  
  // 2. ¿Click en componente?
  componente = getComponentAt(col, row)
  SI componente:
    SI event.ctrlKey:
      // Selección múltiple
      toggleSelección(componente)
    SINO:
      seleccionarÚnico(componente)
    FIN SI
    
    // Detectar si es un blackbox y qué parte
    SI componente.type == 'blackbox':
      handle = detectarHandleResize(componente, x, y)
      SI handle:
        iniciarResize(componente, handle)
      FIN SI
    FIN SI
    
    RETORNAR
  FIN SI
  
  // 3. ¿Click en vacío?
  SI placingType:
    colocarComponente(col, row, placingType)
  SINO:
    deseleccionarTodo()
  FIN SI
FIN FUNCIÓN
```

#### Algoritmo de Redimensionamiento
```
FUNCIÓN iniciarResize(componente, handle):
  this.dragMode = 'resize'
  this.resizeHandle = handle
  this.dragStart = { col: componente.col, row: componente.row, w: componente.width, h: componente.height }
FIN FUNCIÓN

FUNCIÓN actualizarResize(componente, deltaCol, deltaRow):
  SEGÚN this.resizeHandle:
    CASO 'br': // Bottom-right
      nuevoW = max(2, this.dragStart.w + deltaCol)
      nuevoH = max(2, this.dragStart.h + deltaRow)
      
      // Verificar que no haya colisiones
      SI puedeRedimensionar(componente, nuevoW, nuevoH):
        componente.width = nuevoW
        componente.height = nuevoH
      FIN SI
      
    CASO 'r': // Right
      nuevoW = max(2, this.dragStart.w + deltaCol)
      SI puedeRedimensionar(componente, nuevoW, componente.height):
        componente.width = nuevoW
      FIN SI
      
    // ... otros casos de handles
  FIN SEGÚN
FIN FUNCIÓN
```

---

### FASE 6: SISTEMA DE ETIQUETADO Y REFERENCIAS

#### Generador de Referencias Cruzadas
```
FUNCIÓN generarReferenciasCruzadas():
  referencias = {}
  
  // Recorrer todas las páginas
  PARA cada página EN this.pages:
    PARA cada componente EN página.elements:
      SI referencias[componente.label]:
        // Este componente aparece en múltiples páginas
        referencias[componente.label].push({
          pageIndex: índice_de_página,
          pageName: página.name,
          col: componente.col,
          row: componente.row
        })
      SINO:
        referencias[componente.label] = [{
          pageIndex: índice_de_página,
          pageName: página.name,
          col: componente.col,
          row: componente.row
        }]
      FIN SI
    FIN PARA
  FIN PARA
  
  // Filtrar solo referencias múltiples
  RETORNAR filtrar(referencias, (k, v) => v.length > 1)
FIN FUNCIÓN

FUNCIÓN formatearReferenciaIEC(pageIndex, col):
  // Formato: /página.columna (ej: /5.2)
  RETORNAR `/${pageIndex}.${col + 1}`
FIN FUNCIÓN
```

---

### FASE 7: INTERFACE DE USUARIO MEJORADA

#### Panel de Propiedades Extendido
```javascript
const INSPECTOR_TABS = {
  general: {
    fields: ['label', 'type', 'position', 'description']
  },
  electrical: {
    fields: ['voltage', 'current', 'power', 'frequency', 'phases']
  },
  mechanical: {
    fields: ['manufacturer', 'partNumber', 'weight', 'dimensions']
  },
  connections: {
    render: renderConnectionsPanel
  },
  catalog: {
    fields: ['catalogNumber', 'supplier', 'price', 'leadTime']
  }
};
```

#### Herramientas de Edición Rápida
```
ACCIONES_RÁPIDAS = {
  'Ctrl+C': copiarSelección,
  'Ctrl+V': pegarComponentes,
  'Ctrl+D': duplicarComponente,
  'Delete': eliminarSelección,
  'Ctrl+G': agrupar,
  'Ctrl+Shift+G': desagrupar,
  'R': rotarComponente,
  'F': reflejarHorizontal,
  'Shift+F': reflejarVertical,
  'A': alinearIzquierda,
  'S': alinearCentro,
  'D': alinearDerecha,
  'W': conectarABarra('power'),
  'E': conectarABarra('common')
};
```

---

## 📋 CHECKLIST IMPLEMENTACIÓN

### NIVEL 1: BARRAS HORIZONTALES ⚡
- [ ] Definir estructura de datos `HorizontalBusbar`
- [ ] Implementar renderizado de barras horizontales
- [ ] Sistema de puntos de conexión en barras
- [ ] Conectar componentes a barras (vertical drop)
- [ ] UI para agregar/eliminar barras
- [ ] Etiquetado automático de barras

### NIVEL 2: TERMINALES MÚLTIPLES 🔌
- [ ] Extender schema de componentes con terminales
- [ ] Algoritmo de cálculo de posición de terminales
- [ ] Renderizado de terminales en componentes
- [ ] Selector de terminal en inspector
- [ ] Conexión terminal-específica (no solo top/bottom)
- [ ] Validación de compatibilidad de conexiones

### NIVEL 3: BLACK BOX COMPONENTS 📦
- [ ] Clase `BlackBoxComponent`
- [ ] Detección de colisiones multi-celda
- [ ] Handles de redimensionamiento (8 puntos)
- [ ] Algoritmo de resize con restricciones
- [ ] Elementos internos decorativos
- [ ] Templates de BlackBox (PLC, VFD, Panel, etc.)

### NIVEL 4: CABLEADO AVANZADO 🔗
- [ ] Estructura de cable extendida
- [ ] Algoritmo de ruteo ortogonal
- [ ] Esquinas redondeadas en cables
- [ ] Etiquetas de cable en línea
- [ ] Editor de propiedades de cable
- [ ] Código de cable automático (-W1, -W2, etc.)
- [ ] Resumen de cables automático

### NIVEL 5: NOMENCLATURA IEC 750 📖
- [ ] Generador de nomenclatura automática
- [ ] Formato: =CÓDIGO+UBICACIÓN-COMPONENTE:BORNE
- [ ] Validador de nomenclatura
- [ ] Búsqueda por nomenclatura
- [ ] Exportar lista de nomenclatura

### NIVEL 6: INTERFACE DE USUARIO 🎨
- [ ] Toolbar flotante con herramientas frecuentes
- [ ] Inspector con tabs (General/Eléctrico/Mecánico/Catálogo)
- [ ] Panel de capas (layers)
- [ ] Mini-mapa de navegación
- [ ] Reglas y guías
- [ ] Snapping a grid mejorado
- [ ] Zoom con Ctrl+MouseWheel
- [ ] Pan con barra espaciadora

### NIVEL 7: FUNCIONES AVANZADAS 🚀
- [ ] Copiar/Pegar entre páginas
- [ ] Biblioteca de templates
- [ ] Importar desde AutoCAD DXF
- [ ] Exportar a SVG
- [ ] Generación automática BOM
- [ ] Validación de circuito
- [ ] Simulación básica de flujo

---

## 🎨 MEJORAS VISUALES DETECTADAS

### Estilo IEC Profesional
```css
/* Basado en diagramas Fosber */
:root {
  --busbar-l1-color: #000000;
  --busbar-l2-color: #000000;
  --busbar-l3-color: #000000;
  --busbar-pe-color: #00aa00;
  --busbar-0v-color: #0066ff;
  --busbar-24v-color: #ff6600;
  
  --wire-1-5mm: 1.5px;
  --wire-2-5mm: 2px;
  --wire-4mm: 2.5px;
  --wire-6mm: 3px;
  --wire-10mm: 4px;
  
  --component-shadow: 0 2px 4px rgba(0,0,0,0.3);
  --selected-glow: 0 0 10px #00ff41;
}
```

### Colores de Cables IEC
```javascript
const IEC_WIRE_COLORS = {
  BK: { name: 'Negro', hex: '#000000', code: 'Black' },
  BN: { name: 'Marrón', hex: '#8B4513', code: 'Brown' },
  RD: { name: 'Rojo', hex: '#ff0000', code: 'Red' },
  OG: { name: 'Naranja', hex: '#ff8800', code: 'Orange' },
  YW: { name: 'Amarillo', hex: '#ffff00', code: 'Yellow' },
  GN: { name: 'Verde', hex: '#00aa00', code: 'Green' },
  BU: { name: 'Azul', hex: '#0066ff', code: 'Blue' },
  VT: { name: 'Violeta', hex: '#8800ff', code: 'Violet' },
  GY: { name: 'Gris', hex: '#808080', code: 'Gray' },
  WH: { name: 'Blanco', hex: '#ffffff', code: 'White' },
  GNYE: { name: 'Verde/Amarillo', hex: '#88cc00', code: 'GreenYellow' },
  PK: { name: 'Rosa', hex: '#ff66ff', code: 'Pink' }
};
```

---

## 🔄 FLUJO DE TRABAJO ÓPTIMO

### Proceso de Creación de Diagrama
```
1. CREAR PROYECTO
   ├─ Ingresar datos de cajetín (máquina, comisión, etc.)
   └─ Configurar estructura de páginas

2. CONFIGURAR BARRAS DE ALIMENTACIÓN
   ├─ Agregar barra L1 (fase 1)
   ├─ Agregar barra L2 (fase 2)
   ├─ Agregar barra L3 (fase 3)
   ├─ Agregar barra PE0 (tierra)
   ├─ Agregar barra X0.0 (0V común)
   └─ Agregar barra X0.1 (+24V común)

3. COLOCAR COMPONENTES
   ├─ Desde paleta: arrastrar a celda
   ├─ Auto-etiquetado (QF1, KM1, etc.)
   ├─ Auto-conexión a barra superior si aplica
   └─ Propiedades en inspector

4. CONECTAR COMPONENTES
   ├─ Click en terminal origen
   ├─ Click en terminal destino
   ├─ Especificar propiedades de cable
   └─ Auto-ruteo ortogonal

5. AGREGAR BLACK BOXES (PLCs, VFDs)
   ├─ Seleccionar tipo de BlackBox
   ├─ Definir tamaño (width x height)
   ├─ Configurar terminales
   └─ Posicionar en grid

6. DOCUMENTAR
   ├─ Referencias cruzadas automáticas
   ├─ Generar BOM
   ├─ Generar lista de cables
   └─ Exportar PDF con cajetín

7. REVISAR Y FINALIZAR
   ├─ Cambiar a modo "Revisión"
   ├─ Validar conexiones
   ├─ Marcar como "Finalizado"
   └─ Bloquear edición
```

---

## 🎯 PRIORIDADES DE DESARROLLO

### PRIORIDAD ALTA (Semana 1)
1. ✅ Sistema de barras horizontales básico
2. ✅ Conexión vertical a barras
3. ✅ Etiquetado de cables mejorado
4. ✅ Inspector con tabs

### PRIORIDAD MEDIA (Semana 2)
5. ⚡ Terminales múltiples en componentes
6. ⚡ Ruteo ortogonal de cables
7. ⚡ BlackBox básico (PLC, VFD)

### PRIORIDAD BAJA (Semana 3)
8. 🔄 Templates y biblioteca
9. 🔄 Importar/Exportar avanzado
10. 🔄 Validación de circuito

---

## 💡 INNOVACIONES PROPUESTAS

### 1. Auto-Nomenclatura IEC
```
Ejemplo: Variador de frecuencia en cuadro principal
- Código: =MS4+Q0-T8.1
  = MS4 (código máquina: Master 400)
  + Q0 (ubicación: Cuadro eléctrico general)
  - T8.1 (componente: Variador 8, instancia 1)
  : IN3 (borne específico)
```

### 2. Plantillas Inteligentes
```javascript
const DIAGRAM_TEMPLATES = {
  motor_starter_3ph: {
    name: 'Arrancador Motor Trifásico',
    components: [
      { type: 'breaker', label: 'QF{n}' },
      { type: 'contactor', label: 'KM{n}' },
      { type: 'thermal_relay', label: 'F{n}' },
      { type: 'motor', label: 'M{n}' }
    ],
    connections: 'auto', // Conectar en cascada
    busbarConnections: ['L1', 'L2', 'L3', 'PE']
  }
};
```

### 3. Asistente de Cableado
```
FUNCIÓN asistenteCableado(desde, hacia):
  // Sugerir automáticamente:
  sección = calcularSecciónCable(desde.current, hacia.current)
  color = sugerirColorPorFunción(desde.terminal, hacia.terminal)
  tipo = sugerirTipoCable(desde.voltage, hacia.application)
  
  RETORNAR {
    section: sección,
    color: color,
    cableType: tipo,
    suggested: true
  }
FIN FUNCIÓN
```

---

## 📊 ESTRUCTURA DE DATOS FINAL

### Diagrama Completo
```javascript
{
  id: 'diag_001',
  name: 'SINGLE PREHEATER B.0',
  machineCode: 'SPH(1)',
  jobNr: '4607',
  comision: 'COM17310',
  designNr: '1076893',
  
  pages: [
    {
      id: 'page_1',
      name: 'Alimentación General',
      type: 'power',
      iecCode: '+Q0-003',
      rows: 12,
      
      // Barras horizontales
      busbars: [
        { id: 'L1', name: 'L1', row: 0, color: '#000', voltage: '460VAC', section: '35mm²' },
        { id: 'L2', name: 'L2', row: 0, color: '#000', voltage: '460VAC', section: '35mm²' },
        { id: 'L3', name: 'L3', row: 0, color: '#000', voltage: '460VAC', section: '35mm²' },
        { id: 'PE', name: 'PE0', row: 0, color: '#0a0', voltage: 'GND', section: '16mm²' }
      ],
      
      // Componentes
      elements: [
        {
          id: 'c_001',
          type: 'breaker',
          label: 'QF1',
          col: 2,
          row: 3,
          nomenclature: '=SPH(1)+Q0-QF1',
          props: {
            manufacturer: 'Moeller',
            partNumber: 'FAZ-C10/1',
            voltage: '460V',
            current: '10A',
            poles: 1
          },
          terminals: {
            L1: { connected: 'L1_busbar', col: 2 },
            T1: { connected: 'c_002', terminal: 'L1' }
          }
        },
        {
          id: 'c_002',
          type: 'vfd',
          label: 'T5.1',
          col: 2,
          row: 5,
          width: 2,  // Ocupa 2 columnas
          height: 3, // Ocupa 3 filas
          nomenclature: '=SPH(1)+Q0-T5.1',
          props: {
            manufacturer: 'Allen-Bradley',
            partNumber: 'PF40P 400/480V',
            power: '4.0KW'
          }
        }
      ],
      
      // Conexiones
      wires: [
        {
          id: 'w_001',
          cableLabel: '-W1',
          from: 'c_001',
          fromTerminal: 'T1',
          to: 'c_002',
          toTerminal: 'L1',
          section: '2.5',
          color: 'Negro',
          colorCode: 'BK',
          cableType: 'H07V-K',
          length: '1.5',
          route: {
            type: 'vertical',
            waypoints: []
          }
        }
      ],
      
      // Conexiones a barras
      busbarConnections: [
        {
          busbar: 'L1',
          component: 'c_001',
          terminal: 'L1',
          column: 2
        }
      ]
    }
  ]
}
```

---

## 🛠️ HERRAMIENTAS DE DESARROLLO

### Modo Debug
```javascript
const DEBUG_TOOLS = {
  showGrid: true,
  showTerminals: true,
  showBounds: true,
  showConnectionPoints: true,
  logWireRoutes: false,
  highlightCollisions: true
};
```

### Validadores
```
FUNCIÓN validarDiagrama(diagram):
  errores = []
  advertencias = []
  
  // Validar nomenclatura
  PARA cada componente:
    SI NO esNomenclaturaIECValida(componente.label):
      errores.push(`${componente.label}: Nomenclatura inválida`)
    FIN SI
  FIN PARA
  
  // Validar conexiones
  PARA cada wire:
    SI NO existeComponente(wire.from) O NO existeComponente(wire.to):
      errores.push(`Cable ${wire.id}: Conexión a componente inexistente`)
    FIN SI
    
    SI wire.section < calcularSecciónMínima(wire):
      advertencias.push(`Cable ${wire.cableLabel}: Sección insuficiente`)
    FIN SI
  FIN PARA
  
  // Validar tierras
  componentes_sin_tierra = filtrar(componentes, c => requiereTierra(c) Y NO tieneTierra(c))
  PARA cada comp EN componentes_sin_tierra:
    advertencias.push(`${comp.label}: Falta conexión a tierra`)
  FIN PARA
  
  RETORNAR { errores, advertencias }
FIN FUNCIÓN
```

---

## 📐 ESPECIFICACIONES TÉCNICAS

### Grid System
- **Columnas:** 10 (fijo, estándar IEC)
- **Filas:** Variable (12-20 típico)
- **Celda mínima:** 60x60px
- **Celda óptima:** 80x80px
- **Celda máxima:** 120x120px (zoom)

### Capas de Renderizado
```
Orden de dibujado (de fondo a frente):
1. Fondo del canvas
2. Grid (líneas de guía)
3. Barras horizontales
4. Cables/Wires
5. Componentes
6. Terminales
7. Etiquetas de cables
8. Selección/Highlight
9. Herramientas de edición
```

### Performance
- **Componentes máximos por página:** 200
- **Cables máximos:** 500
- **Páginas máximas:** 50
- **Renderizado:** Canvas 2D con offscreen caching
- **Actualización:** Requestanimationframe throttled a 60fps

---

## 🎓 PRINCIPIOS DE DISEÑO

### 1. Intuitividad
- Drag & Drop desde paleta
- Click derecho para menú contextual
- Double-click para editar propiedades
- Hover para preview

### 2. Consistencia IEC
- Todos los símbolos según IEC 60617
- Nomenclatura IEC 750 / CEI 3-34
- Colores según EN 60204-1

### 3. Productividad
- Atajos de teclado
- Plantillas reutilizables
- Auto-completado
- Validación en tiempo real

### 4. Profesionalismo
- Cajetín completo y personalizable
- Referencias cruzadas automáticas
- BOM generado automáticamente
- PDF listo para imprimir

---

## 🔍 CASOS DE USO PRIORITARIOS

### Caso 1: Diagrama de Alimentación Trifásica
```
1. Usuario crea página tipo "Alimentación General"
2. Sistema auto-agrega barras L1, L2, L3, PE
3. Usuario arrastra interruptor general (QS) desde paleta
4. Click en QS conecta a barras automáticamente
5. Usuario arrastra fusibles (FU) debajo de QS
6. Auto-conexión vertical QS → FU
7. Usuario agrega variador (VFD)
8. Sistema sugiere conexión trifásica
9. Usuario confirma, se crean 4 cables (L1,L2,L3,PE)
10. Etiquetas automáticas: -W1, -W2, -W3, -W4
```

### Caso 2: PLC con 16 Entradas Digitales
```
1. Usuario arrastra BlackBox "PLC-16DI"
2. Sistema crea caja de 3x4 celdas
3. Auto-genera 16 terminales lado izquierdo (IN0-IN15)
4. Usuario conecta sensores a terminales
5. Inspector muestra tabla de asignación I/O
6. Exportar genera tabla de direccionamiento
```

---

## 📈 MÉTRICAS DE ÉXITO

- ⏱️ **Tiempo de creación:** Reducir 50% vs. dibujo manual
- 🎯 **Precisión:** 100% nomenclatura IEC válida
- 📄 **Completitud:** BOM + Lista de cables automática
- ✅ **Validación:** 0 errores de conexión
- 🖨️ **Calidad:** PDF idéntico a diagramas profesionales

---

## 🚀 ROADMAP DE IMPLEMENTACIÓN

### Sprint 1 (Semana 1): Fundamentos
- Barras horizontales básicas
- Conexión a barras
- Terminales múltiples en componentes existentes

### Sprint 2 (Semana 2): Componentes Avanzados
- BlackBox redimensionable
- PLC template
- VFD template
- Ruteo ortogonal de cables

### Sprint 3 (Semana 3): Usabilidad
- Inspector con tabs
- Toolbar flotante
- Mini-mapa
- Zoom/Pan

### Sprint 4 (Semana 4): Documentación
- Generador BOM mejorado
- Lista de cables con referencias
- Validación completa
- Exportación avanzada

---

## 🔧 CONSIDERACIONES TÉCNICAS

### Compatibilidad con Editor Actual
- ✅ Mantener retrocompatibilidad con diagramas existentes
- ✅ Migración automática de formato antiguo
- ✅ Export/Import sin pérdida de datos

### Optimización
```javascript
// Cache de renderizado
const renderCache = new Map();

function renderizarComponenteConCache(ctx, component) {
  const cacheKey = `${component.id}_${component.type}_${component.label}`;
  
  if (!renderCache.has(cacheKey)) {
    // Crear canvas offscreen
    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d');
    
    // Renderizar componente
    IEC_COMPONENTS[component.type].draw(octx, 0, 0, CELL_W, CELL_H, component.label);
    
    // Guardar en cache
    renderCache.set(cacheKey, offscreen);
  }
  
  // Dibujar desde cache
  const cached = renderCache.get(cacheKey);
  ctx.drawImage(cached, component.col * CELL_W, component.row * CELL_H);
}
```

---

## ✨ CONCLUSIÓN

Basado en el análisis de los diagramas profesionales de Fosber, el editor actual tiene una **base sólida** con:
- ✅ Grid correcto
- ✅ Componentes IEC estándar
- ✅ Multi-página
- ✅ Cajetín profesional

Las **mejoras críticas** necesarias son:
1. 🔴 **Barras horizontales de alimentación** (game changer)
2. 🟡 **Terminales múltiples** (flexibilidad)
3. 🟡 **BlackBox redimensionable** (componentes complejos)
4. 🟢 **Ruteo ortogonal** (presentación profesional)

Con estas 4 mejoras, el editor podrá **replicar exactamente** los diagramas profesionales analizados.

---

**Siguiente Paso:** Implementar FASE 1 - Sistema de Barras Horizontales

**Autor:** CRGM AI Assistant  
**Versión del Plan:** 1.0  
**Fecha:** 11/02/2026
