/**
 * CRGM-API - Editor Visual de Diagramas Eléctricos
 * Canvas HTML5 con grid de 10 columnas, componentes IEC, auto-conexión
 * Multi-página, Modos de Trabajo, PDF con Cajetín, Referencias Cruzadas
 * Versión: 3.0.0
 */

// ============================================
// PAGE TYPES (Tipos de hoja)
// ============================================
// Secciones basadas en nomenclatura (IEC 750 / CEI 3-34)
// =SPH(1)+M0 Portada/Índice, +Q0 Cuadro eléctrico, +W0 Cables, +P0 BOM, +SR Seguridad
const PAGE_TYPES = {
  portada:    { name: 'Portada / Índice',         icon: '📋', color: '#888',    iecCode: '+M0' },
  power:      { name: 'Alimentación General',      icon: '🔌', color: '#ff3300', iecCode: '+Q0' },
  protection: { name: 'Protecciones',              icon: '🛡️', color: '#ff9900', iecCode: '+Q0' },
  control:    { name: 'Control',                   icon: '🔧', color: '#00ff41', iecCode: '+Q0' },
  potencia:   { name: 'Potencia / Motores',        icon: '⚡', color: '#ffdd00', iecCode: '+Q0' },
  seguridad:  { name: 'Gestión Seguridad',         icon: '🔒', color: '#ff2222', iecCode: '+SR' },
  plc_in:     { name: 'PLC Entradas',              icon: '📥', color: '#00ffaa', iecCode: '+Q0' },
  plc_out:    { name: 'PLC Salidas',               icon: '📤', color: '#00ddff', iecCode: '+Q0' },
  plc_com:    { name: 'PLC Comunicaciones',        icon: '🌐', color: '#aa66ff', iecCode: '+Q0' },
  borneras:   { name: 'Plano de Bornes',           icon: '🔩', color: '#ff66aa', iecCode: '+Q0' },
  cables:     { name: 'Resumen de Cables',         icon: '📎', color: '#ffaa44', iecCode: '+W0' },
  bom:        { name: 'Lista de Materiales (BOM)', icon: '📦', color: '#44aaff', iecCode: '+P0' },
  layout:     { name: 'Layout Tablero',            icon: '📐', color: '#aaddff', iecCode: '+Q0' },
  general:    { name: 'General',                   icon: '📄', color: '#aaaaaa', iecCode: '+Q0' }
};

const WORK_MODES = {
  edicion:    { name: 'Edición', icon: '✏️', color: '#00ff41', readonly: false },
  revision:   { name: 'Revisión', icon: '👁️', color: '#ffdd00', readonly: true },
  finalizado: { name: 'Finalizado', icon: '🔒', color: '#ff3300', readonly: true }
};

// ============================================
// ⚡ FASE 2: MULTI-TERMINAL COMPONENT SCHEMA
// ============================================
// Definición avanzada de terminales para componentes complejos
const COMPONENT_TERMINAL_SCHEMA = {
  // ═══ VFD / VARIADOR DE FRECUENCIA ═══
  vfd: {
    terminals: {
      // Entrada AC (arriba)
      L1: { side: 'top', offset: -0.3, label: 'L1', type: 'power' },
      L2: { side: 'top', offset: 0, label: 'L2', type: 'power' },
      L3: { side: 'top', offset: 0.3, label: 'L3', type: 'power' },
      PE1: { side: 'top', offset: 0.45, label: 'PE', type: 'ground' },
      
      // Salida AC (abajo)
      U: { side: 'bottom', offset: -0.3, label: 'U', type: 'power' },
      V: { side: 'bottom', offset: 0, label: 'V', type: 'power' },
      W: { side: 'bottom', offset: 0.3, label: 'W', type: 'power' },
      PE2: { side: 'bottom', offset: 0.45, label: 'PE', type: 'ground' },
      
      // Control DC (derecha)
      'DC+': { side: 'right', offset: -0.3, label: 'DC+', type: 'control' },
      'DC-': { side: 'right', offset: -0.1, label: 'DC-', type: 'control' },
      'BR+': { side: 'right', offset: 0.1, label: 'BR+', type: 'control' },
      'BR-': { side: 'right', offset: 0.3, label: 'BR-', type: 'control' }
    }
  },
  
  // ═══ CONTACTOR TRIFÁSICO ═══
  contactor: {
    terminals: {
      // Entrada (arriba) - terminales 1, 3, 5
      '1': { side: 'top', offset: -0.3, label: '1', type: 'power' },
      '3': { side: 'top', offset: 0, label: '3', type: 'power' },
      '5': { side: 'top', offset: 0.3, label: '5', type: 'power' },
      
      // Salida (abajo) - terminales 2, 4, 6
      '2': { side: 'bottom', offset: -0.3, label: '2', type: 'power' },
      '4': { side: 'bottom', offset: 0, label: '4', type: 'power' },
      '6': { side: 'bottom', offset: 0.3, label: '6', type: 'power' },
      
      // Bobina (izquierda)
      'A1': { side: 'left', offset: -0.2, label: 'A1', type: 'control' },
      'A2': { side: 'left', offset: 0.2, label: 'A2', type: 'control' }
    }
  },
  
  // ═══ GUARDAMOTOR TRIFÁSICO ═══
  motor_protection: {
    terminals: {
      // Entrada (arriba)
      '1': { side: 'top', offset: -0.3, label: '1', type: 'power' },
      '3': { side: 'top', offset: 0, label: '3', type: 'power' },
      '5': { side: 'top', offset: 0.3, label: '5', type: 'power' },
      
      // Salida (abajo) 
      '2': { side: 'bottom', offset: -0.3, label: '2', type: 'power' },
      '4': { side: 'bottom', offset: 0, label: '4', type: 'power' },
      '6': { side: 'bottom', offset: 0.3, label: '6', type: 'power' },
      
      // Auxiliares térmicos (derecha)
      '95': { side: 'right', offset: -0.2, label: '95', type: 'aux' },
      '96': { side: 'right', offset: 0, label: '96', type: 'aux' },
      '97': { side: 'right', offset: 0.2, label: '97', type: 'aux' },
      '98': { side: 'right', offset: 0.4, label: '98', type: 'aux' }
    }
  },
  
  // ═══ PLC MÓDULO (8 I/O) ═══
  plc_module: {
    terminals: {
      // Alimentación (arriba)
      'V+': { side: 'top', offset: -0.3, label: '+24V', type: 'power' },
      'V-': { side: 'top', offset: 0.3, label: '0V', type: 'power' },
      
      // Entradas digitales (izquierda)
      'I0': { side: 'left', offset: -0.35, label: 'I0', type: 'input' },
      'I1': { side: 'left', offset: -0.25, label: 'I1', type: 'input' },
      'I2': { side: 'left', offset: -0.15, label: 'I2', type: 'input' },
      'I3': { side: 'left', offset: -0.05, label: 'I3', type: 'input' },
      'I4': { side: 'left', offset: 0.05, label: 'I4', type: 'input' },
      'I5': { side: 'left', offset: 0.15, label: 'I5', type: 'input' },
      'I6': { side: 'left', offset: 0.25, label: 'I6', type: 'input' },
      'I7': { side: 'left', offset: 0.35, label: 'I7', type: 'input' },
      
      // Salidas digitales (derecha)
      'Q0': { side: 'right', offset: -0.35, label: 'Q0', type: 'output' },
      'Q1': { side: 'right', offset: -0.25, label: 'Q1', type: 'output' },
      'Q2': { side: 'right', offset: -0.15, label: 'Q2', type: 'output' },
      'Q3': { side: 'right', offset: -0.05, label: 'Q3', type: 'output' },
      'Q4': { side: 'right', offset: 0.05, label: 'Q4', type: 'output' },
      'Q5': { side: 'right', offset: 0.15, label: 'Q5', type: 'output' },
      'Q6': { side: 'right', offset: 0.25, label: 'Q6', type: 'output' },
      'Q7': { side: 'right', offset: 0.35, label: 'Q7', type: 'output' }
    }
  },
  
  // ═══ RELÉ AUXILIAR (4 contactos) ═══
  relay: {
    terminals: {
      // Bobina (arriba)
      'A1': { side: 'top', offset: -0.2, label: 'A1', type: 'coil' },
      'A2': { side: 'top', offset: 0.2, label: 'A2', type: 'coil' },
      
      // Contactos NA (izquierda)
      '13': { side: 'left', offset: -0.3, label: '13', type: 'contact_no' },
      '14': { side: 'left', offset: -0.1, label: '14', type: 'contact_no' },
      '23': { side: 'left', offset: 0.1, label: '23', type: 'contact_no' },
      '24': { side: 'left', offset: 0.3, label: '24', type: 'contact_no' },
      
      // Contactos NC (derecha)
      '11': { side: 'right', offset: -0.3, label: '11', type: 'contact_nc' },
      '12': { side: 'right', offset: -0.1, label: '12', type: 'contact_nc' },
      '21': { side: 'right', offset: 0.1, label: '21', type: 'contact_nc' },
      '22': { side: 'right', offset: 0.3, label: '22', type: 'contact_nc' }
    }
  },
  
  // ═══ TERMINAL BLOCK (6 puntos) ═══
  terminal_block: {
    terminals: {
      '1': { side: 'top', offset: -0.4, label: '1', type: 'terminal' },
      '2': { side: 'top', offset: -0.2, label: '2', type: 'terminal' },
      '3': { side: 'top', offset: 0, label: '3', type: 'terminal' },
      '4': { side: 'bottom', offset: -0.4, label: '4', type: 'terminal' },
      '5': { side: 'bottom', offset: -0.2, label: '5', type: 'terminal' },
      '6': { side: 'bottom', offset: 0, label: '6', type: 'terminal' }
    }
  }
};

// ============================================
// ⚡ FASE 4: ADVANCED WIRING SYSTEM
// ============================================

// Colores de cables según norma IEC 60204-1
const IEC_WIRE_COLORS = {
  BK: { name: 'Negro', hex: '#000000', code: 'BK', description: 'Líneas de alimentación L1, L2, L3' },
  BN: { name: 'Marrón', hex: '#8B4513', code: 'BN', description: 'Fase alternativa' },
  RD: { name: 'Rojo', hex: '#ff0000', code: 'RD', description: 'Control +24VDC, parada de emergencia' },
  OG: { name: 'Naranja', hex: '#ff8800', code: 'OG', description: 'Señales de advertencia' },
  YW: { name: 'Amarillo', hex: '#ffff00', code: 'YW', description: 'Señales de precaución' },
  GN: { name: 'Verde', hex: '#00aa00', code: 'GN', description: 'Circuitos de seguridad' },
  BU: { name: 'Azul', hex: '#0066ff', code: 'BU', description: 'Neutro, 0VDC común' },
  VT: { name: 'Violeta', hex: '#8800ff', code: 'VT', description: 'Circuitos especiales' },
  GY: { name: 'Gris', hex: '#808080', code: 'GY', description: 'Líneas de medición' },
  WH: { name: 'Blanco', hex: '#ffffff', code: 'WH', description: 'Neutro alternativo' },
  GNYE: { name: 'Verde/Amarillo', hex: '#88cc00', code: 'GNYE', description: 'Tierra de protección PE' },
  PK: { name: 'Rosa', hex: '#ff66ff', code: 'PK', description: 'Circuitos auxiliares' }
};

// Tipos de cable estándar
const CABLE_TYPES = {
  'H07V-K': { name: 'H07V-K', description: 'Cable flexible cobre, 450/750V', tempMax: '70°C' },
  'H07V-U': { name: 'H07V-U', description: 'Cable rígido cobre, 450/750V', tempMax: '70°C' },
  'H07V-R': { name: 'H07V-R', description: 'Cable semi-flexible cobre, 450/750V', tempMax: '70°C' },
  'NYA': { name: 'NYA', description: 'Cable rígido instalación fija, 450/750V', tempMax: '70°C' },
  'RV-K': { name: 'RV-K', description: 'Cable apantallado control, 0.6/1kV', tempMax: '90°C' },
  'UL1007': { name: 'UL1007', description: 'Cable electrónico AWG, 300V', tempMax: '80°C' }
};

// Secciones estándar de cable (mm²)
const WIRE_SECTIONS = ['0.25', '0.5', '0.75', '1', '1.5', '2.5', '4', '6', '10', '16', '25', '35', '50'];

// ============================================
// HORIZONTAL BUSBARS SYSTEM (FASE 1)
// ============================================
// Barras horizontales de alimentación estándar IEC
const BUSBAR_TYPES = {
  L1: {
    id: 'L1',
    name: 'L1',
    color: '#000000',
    description: 'Línea 1 (Fase 1)',
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK', // Black
    category: 'power'
  },
  L2: {
    id: 'L2', 
    name: 'L2',
    color: '#000000',
    description: 'Línea 2 (Fase 2)',
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK', // Black
    category: 'power'
  },
  L3: {
    id: 'L3',
    name: 'L3', 
    color: '#000000',
    description: 'Línea 3 (Fase 3)',
    voltage: '400-460VAC',
    section: '35mm²',
    wireType: 'BK', // Black
    category: 'power'
  },
  N: {
    id: 'N',
    name: 'N',
    color: '#0066ff',
    description: 'Neutro',
    voltage: '0VAC',
    section: '16mm²',
    wireType: 'BU', // Blue
    category: 'power'
  },
  PE: {
    id: 'PE',
    name: 'PE0',
    color: '#00aa00',
    description: 'Tierra de Protección',
    voltage: 'GND',
    section: '16mm²',
    wireType: 'GNYE', // Green/Yellow
    category: 'ground'
  },
  DC24V: {
    id: 'DC24V',
    name: 'X0.1',
    color: '#ff6600',
    description: '+24VDC Común',
    voltage: '+24VDC',
    section: '2.5mm²',
    wireType: 'RD', // Red
    category: 'control'
  },
  DC0V: {
    id: 'DC0V',
    name: 'X0.0',
    color: '#0066ff',
    description: '0VDC Común',
    voltage: '0VDC',
    section: '2.5mm²',
    wireType: 'BU', // Blue
    category: 'control'
  }
};

// ============================================
// DEFINICIONES DE COMPONENTES IEC
// ============================================
const IEC_COMPONENTS = {
  // ═══════════════════════════════════════
  // PROTECCIONES (extraídos de diagramas TWIN 400 / TERMINAL 400)
  // ═══════════════════════════════════════
  main_switch: {
    category: 'proteccion',
    name: 'Int. General (QS)',
    prefix: 'QS',
    color: '#ff0000',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 16); ctx.stroke();
      // Handle
      ctx.beginPath(); ctx.moveTo(cx - 14, cy - 8); ctx.lineTo(cx + 14, cy - 8); ctx.stroke();
      // Switch blade
      ctx.beginPath(); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx + 14, cy + 8); ctx.stroke();
      // Lock symbol
      ctx.strokeRect(cx - 5, cy + 2, 10, 8);
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },
  breaker: {
    category: 'proteccion',
    name: 'Breaker (QF)',
    prefix: 'QF',
    color: '#ff3300',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      // Vertical line top
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 14);
      ctx.stroke();
      // Breaker symbol (angled line)
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 12, cy + 10);
      ctx.stroke();
      // Small square (mechanism)
      ctx.strokeRect(cx - 4, cy - 4, 8, 8);
      // Vertical line bottom
      ctx.beginPath();
      ctx.moveTo(cx, cy + 14);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      // Label
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },
  fuse: {
    category: 'proteccion',
    name: 'Fusible (FU)',
    prefix: 'FU',
    color: '#ff9900',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 12);
      ctx.stroke();
      // Fuse rectangle
      ctx.strokeRect(cx - 5, cy - 12, 10, 24);
      // Line through
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 12);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 12, cy + 4);
    }
  },
  motor_protection: {
    category: 'proteccion',
    name: 'Guardamotor (QM)',
    prefix: 'QM',
    color: '#ff5500',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 14);
      ctx.stroke();
      // Breaker + thermal
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 10, cy + 6);
      ctx.stroke();
      ctx.strokeRect(cx - 4, cy - 2, 8, 8);
      // Thermal zigzag
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 10);
      ctx.lineTo(cx - 3, cy + 14);
      ctx.lineTo(cx + 3, cy + 10);
      ctx.lineTo(cx + 6, cy + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },
  // --- Control ---
  contact_no: {
    category: 'control',
    name: 'Contacto NA',
    prefix: 'KA',
    color: '#00ff41',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 8);
      ctx.stroke();
      // NO contact (gap with parallel lines)
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },
  contact_nc: {
    category: 'control',
    name: 'Contacto NC',
    prefix: 'KA',
    color: '#00dd41',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 8);
      ctx.stroke();
      // NC contact (gap with diagonal)
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.stroke();
      // Diagonal bar
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 10);
      ctx.lineTo(cx + 6, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },
  pushbutton: {
    category: 'control',
    name: 'Pulsador (SB)',
    prefix: 'SB',
    color: '#00ddff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 8);
      ctx.stroke();
      // Button symbol
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.stroke();
      // Arrow down
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy - 8);
      ctx.moveTo(cx - 4, cy - 11);
      ctx.lineTo(cx, cy - 8);
      ctx.lineTo(cx + 4, cy - 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },
  coil: {
    category: 'control',
    name: 'Bobina (KM)',
    prefix: 'KM',
    color: '#aa66ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 12);
      ctx.stroke();
      // Coil circle
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      // Parentheses inside
      ctx.beginPath();
      ctx.arc(cx - 4, cy, 6, -0.8, 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 4, cy, 6, Math.PI - 0.8, Math.PI + 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 12);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },
  // --- Potencia ---
  motor: {
    category: 'potencia',
    name: 'Motor (M)',
    prefix: 'M',
    color: '#ffdd00',
    terminals: { top: true, bottom: false },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 16);
      ctx.stroke();
      // Motor circle
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.stroke();
      // M letter
      ctx.fillStyle = this.color;
      ctx.font = 'bold 14px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', cx, cy);
      ctx.textBaseline = 'alphabetic';
      // Label
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },
  soft_starter: {
    category: 'potencia',
    name: 'Arrancador Suave',
    prefix: 'SS',
    color: '#ffaa00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 16);
      ctx.stroke();
      // Rectangle
      ctx.strokeRect(cx - 18, cy - 16, 36, 32);
      // SS text
      ctx.fillStyle = this.color;
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SS', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 22, cy + 4);
    }
  },
  // --- PLC ---
  plc_module: {
    category: 'plc',
    name: 'Módulo PLC (8 bits)',
    prefix: 'PLC',
    color: '#00ffaa',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 22);
      ctx.stroke();
      // PLC rectangle (taller)
      ctx.strokeRect(cx - 20, cy - 22, 40, 44);
      // 8 bit indicators
      for (let i = 0; i < 8; i++) {
        const bx = cx - 14 + (i % 4) * 9;
        const by = cy - 14 + Math.floor(i / 4) * 14;
        ctx.fillStyle = '#003322';
        ctx.fillRect(bx, by, 6, 6);
        ctx.strokeStyle = this.color;
        ctx.strokeRect(bx, by, 6, 6);
      }
      // PLC text
      ctx.fillStyle = this.color;
      ctx.font = 'bold 8px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('PLC', cx, cy + 20);
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.moveTo(cx, cy + 22);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 24, cy + 4);
    }
  },
  // --- Indicadores ---
  lamp: {
    category: 'indicador',
    name: 'Lámpara (H)',
    prefix: 'H',
    color: '#ffdd00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 15);
      ctx.stroke();
      // Lamp circle
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      // X inside
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 7);
      ctx.lineTo(cx + 7, cy + 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + 7);
      ctx.lineTo(cx + 7, cy - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 12);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },
  thermal_relay: {
    category: 'proteccion',
    name: 'Relé Térmico (F)',
    prefix: 'F',
    color: '#ff6644',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 15);
      ctx.stroke();
      // Rectangle
      ctx.strokeRect(cx - 14, cy - 15, 28, 30);
      // Theta symbol
      ctx.fillStyle = this.color;
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('θ', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 15);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },
  transformer: {
    category: 'potencia',
    name: 'Transformador (T)',
    prefix: 'T',
    color: '#cc88ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx, cy - 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + 18);
      ctx.lineTo(cx, y + h - 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0';
      ctx.font = '10px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // ═══════════════════════════════════════════════════════
  // COMPONENTES EXTRAÍDOS DE DIAGRAMAS
  // Ref: 4607COM17310 Single Preheater, 4607COM17293 Terminal
  // ═══════════════════════════════════════════════════════

  // --- Variador de Frecuencia (extraído: PF40P 400/480V 4.0KW) ---
  vfd: {
    category: 'potencia',
    name: 'Variador (VFD)',
    prefix: 'T',
    color: '#ff8800',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 20); ctx.stroke();
      ctx.strokeRect(cx - 20, cy - 20, 40, 40);
      // AC wave inside
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 4);
      ctx.bezierCurveTo(cx - 6, cy - 14, cx - 2, cy - 14, cx, cy - 4);
      ctx.bezierCurveTo(cx + 2, cy + 6, cx + 6, cy + 6, cx + 12, cy - 4);
      ctx.stroke();
      // f~ text
      ctx.fillStyle = this.color; ctx.font = 'bold 9px Courier New';
      ctx.textAlign = 'center'; ctx.fillText('f~', cx, cy + 16);
      ctx.beginPath(); ctx.moveTo(cx, cy + 20); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 24, cy + 4);
    }
  },

  // --- Contactor de seguridad / Contactron (extraído: 3RM1302-1AA04) ---
  contactron: {
    category: 'potencia',
    name: 'Contactron (3RM)',
    prefix: 'Q',
    color: '#ff4466',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 18); ctx.stroke();
      ctx.strokeRect(cx - 18, cy - 18, 36, 36);
      // Safety diamond
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 10, cy);
      ctx.lineTo(cx, cy + 10); ctx.lineTo(cx - 10, cy);
      ctx.closePath(); ctx.stroke();
      // S inside
      ctx.fillStyle = this.color; ctx.font = 'bold 10px Courier New';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath(); ctx.moveTo(cx, cy + 18); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 22, cy + 4);
    }
  },

  // --- Módulo de seguridad (extraído: XPSDMB1132 Schneider) ---
  safety_module: {
    category: 'control',
    name: 'Módulo Seguridad (A)',
    prefix: 'A',
    color: '#ff2222',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 22); ctx.stroke();
      ctx.strokeRect(cx - 22, cy - 22, 44, 44);
      // Safety symbol (triangle with !)
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14); ctx.lineTo(cx + 12, cy + 6); ctx.lineTo(cx - 12, cy + 6);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = this.color; ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath(); ctx.moveTo(cx, cy + 22); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 26, cy + 4);
    }
  },

  // --- Relé auxiliar (extraído: 700-HLT2Z24, Allen-Bradley 24VDC) ---
  relay: {
    category: 'control',
    name: 'Relé Auxiliar (K)',
    prefix: 'K',
    color: '#66aaff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      // K letter
      ctx.fillStyle = this.color; ctx.font = 'bold 14px Courier New';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('K', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Termostato (extraído: Pfannenberg FLZ 530) ---
  thermostat: {
    category: 'control',
    name: 'Termostato (P)',
    prefix: 'P',
    color: '#ff6600',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
      // Temperature symbol
      ctx.fillStyle = this.color; ctx.font = 'bold 10px Courier New';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('°C', cx, cy);
      ctx.textBaseline = 'alphabetic';
      ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Bornera / Terminal Block (extraído: ZDU 2.5/6 Weidmuller) ---
  terminal_block: {
    category: 'bornera',
    name: 'Bornera (X)',
    prefix: 'X',
    color: '#ff66aa',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Terminal block shape (double rectangle)
      ctx.strokeRect(cx - 12, cy - 10, 24, 20);
      ctx.strokeRect(cx - 8, cy - 6, 16, 12);
      // Screw dot
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Barra de tierra (extraído: PE0 Legrand 37389) ---
  ground_bar: {
    category: 'bornera',
    name: 'Barra Tierra (PE)',
    prefix: 'PE',
    color: '#00cc00',
    terminals: { top: true, bottom: false },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 8); ctx.stroke();
      // Ground symbol (3 horizontal lines decreasing)
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 8); ctx.lineTo(cx + 16, cy - 8); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 8); ctx.lineTo(cx + 5, cy + 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },

  // --- Potenciómetro (extraído: ELTRA EPA103/1PR 10K) ---
  potentiometer: {
    category: 'control',
    name: 'Potenciómetro (R)',
    prefix: 'R',
    color: '#ddaa00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      // Resistor zigzag
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 8, cy - 10); ctx.lineTo(cx - 8, cy - 4);
      ctx.lineTo(cx + 8, cy + 2); ctx.lineTo(cx - 8, cy + 8);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();
      // Arrow (potentiometer)
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy - 6); ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx + 14, cy - 6); ctx.lineTo(cx + 12, cy);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Ventilador panel (extraído: Pfannenberg PF32.000 24VDC) ---
  fan: {
    category: 'potencia',
    name: 'Ventilador (M)',
    prefix: 'M',
    color: '#44ddff',
    terminals: { top: true, bottom: false },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 16); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
      // Fan blades
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8); ctx.quadraticCurveTo(cx, cy - 2, cx + 8, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 8); ctx.quadraticCurveTo(cx, cy + 2, cx + 8, cy + 8);
      ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },

  // --- Conector (extraído: M12-4PIN) ---
  connector: {
    category: 'bornera',
    name: 'Conector (XB)',
    prefix: 'XB',
    color: '#cccccc',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Connector semicircle
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
      // Pin dots
      ctx.fillStyle = this.color;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(cx - 6 + i * 4, cy - 4, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // ═══════════════════════════════════════
  // COMPONENTES NUEVOS (RS4 Rotary Shear - )
  // ═══════════════════════════════════════

  // --- Fuente de Alimentación DC (G4.1 Omron S8VK-T48024) ---
  power_supply: {
    category: 'potencia',
    name: 'Fuente DC (G)',
    prefix: 'G',
    color: '#00ccff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      // Rectángulo fuente
      ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      // + y - adentro
      ctx.fillStyle = this.color; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.fillText('+', cx - 6, cy + 4); ctx.fillText('−', cx + 7, cy + 4);
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Filtro EMC/RFI (K3 FINMOTOR) ---
  emc_filter: {
    category: 'proteccion',
    name: 'Filtro EMC (K3)',
    prefix: 'K3',
    color: '#aa88ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.strokeRect(cx - 16, cy - 14, 32, 28);
      // Onda sinusoidal tachada
      ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.bezierCurveTo(cx - 4, cy - 8, cx + 4, cy + 8, cx + 8, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 10, cy + 8); ctx.lineTo(cx + 10, cy - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },

  // --- MCCB Interruptor Molded Case (Q3 NZMN1-A100) ---
  mccb: {
    category: 'proteccion',
    name: 'MCCB (Q)',
    prefix: 'Q',
    color: '#ff4444',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      // Caja del MCCB
      ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      // X de corte
      ctx.beginPath(); ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8); ctx.stroke();
      // I> (sobre-corriente)
      ctx.font = '8px Arial'; ctx.fillStyle = this.color; ctx.textAlign = 'center';
      ctx.fillText('I>', cx, cy - 16);
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Diferencial RCCB (Q5.2 PBSM-402/003) ---
  rccb: {
    category: 'proteccion',
    name: 'Diferencial (RCCB)',
    prefix: 'Q',
    color: '#ff6600',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      // Símbolo diferencial (arco + flecha)
      ctx.beginPath(); ctx.arc(cx, cy, 8, -Math.PI * 0.7, Math.PI * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 6, cy - 2); ctx.lineTo(cx + 10, cy); ctx.lineTo(cx + 6, cy + 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Contactor de potencia (Q8.3 DILM7-01) ---
  contactor: {
    category: 'potencia',
    name: 'Contactor (KM)',
    prefix: 'KM',
    color: '#ff8800',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Contacto NA con línea diagonal
      ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 10, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      // Rectángulo bobina
      ctx.strokeRect(cx + 12, cy - 6, 12, 12);
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 28, cy + 4);
    }
  },

  // --- Resistencia de frenado (E8.1) ---
  brake_resistor: {
    category: 'potencia',
    name: 'Resist. Frenado (E)',
    prefix: 'E',
    color: '#ffaa00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Zigzag resistencia
      ctx.beginPath(); ctx.moveTo(cx, cy - 12);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(cx + (i % 2 === 0 ? 8 : -8), cy - 12 + (i + 1) * 6);
      }
      ctx.lineTo(cx, cy + 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // --- Servo Drive / Inverter (T8.1 Lenze E84AVTCE) ---
  servo_drive: {
    category: 'potencia',
    name: 'Servo Drive (T)',
    prefix: 'T',
    color: '#6666ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 18); ctx.stroke();
      // Caja drive grande
      ctx.strokeRect(cx - 18, cy - 18, 36, 36);
      // Onda AC→DC
      ctx.beginPath(); ctx.moveTo(cx - 10, cy - 4); ctx.bezierCurveTo(cx - 6, cy - 12, cx - 2, cy + 4, cx + 2, cy - 4); ctx.stroke();
      ctx.fillStyle = this.color; ctx.font = '7px Arial'; ctx.textAlign = 'center';
      ctx.fillText('AC', cx - 8, cy + 12); ctx.fillText('DC', cx + 8, cy + 12);
      ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 12, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 18); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 22, cy + 4);
    }
  },

  // --- Parada de Emergencia (S4.1 ZB4-BS8447) ---
  emergency_stop: {
    category: 'seguridad',
    name: 'Parada Emergencia (S)',
    prefix: 'S',
    color: '#ff0000',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Seta
      ctx.beginPath(); ctx.arc(cx, cy - 8, 12, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 4, cy - 8); ctx.lineTo(cx - 4, cy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 4, cy - 8); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
      // NC contact
      ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 4, cy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Selector Rotativo (S6.1 ZB4-BK12137) ---
  selector_switch: {
    category: 'control',
    name: 'Selector (S)',
    prefix: 'S',
    color: '#44ddff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Círculo selector
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      // Flecha selector
      ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 4, cy - 2); ctx.lineTo(cx - 4, cy - 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // --- Sensor Inductivo/Proximidad (S11.1 NBB8-F33-E2-M) ---
  proximity_sensor: {
    category: 'sensor',
    name: 'Sensor Proximidad (B)',
    prefix: 'B',
    color: '#00ff88',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Cuadrado con arco sensor
      ctx.strokeRect(cx - 10, cy - 10, 20, 20);
      ctx.beginPath(); ctx.arc(cx - 10, cy, 6, -Math.PI / 3, Math.PI / 3); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 10, cy, 10, -Math.PI / 4, Math.PI / 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // --- Interruptor Seguridad Magnético (S33 XCSDMP50L01M12) ---
  safety_switch: {
    category: 'seguridad',
    name: 'Int. Seguridad Mag. (S)',
    prefix: 'S',
    color: '#ff4488',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      // Rectángulo con candado
      ctx.strokeRect(cx - 12, cy - 10, 24, 20);
      ctx.beginPath(); ctx.arc(cx, cy - 10, 6, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = this.color; ctx.font = '8px Arial'; ctx.textAlign = 'center';
      ctx.fillText('🔒', cx, cy + 6);
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Fotocelula / Sensor Fotoeléctrico (B20.2 IFMO5D100) ---
  photoelectric_sensor: {
    category: 'sensor',
    name: 'Fotocelula (B)',
    prefix: 'B',
    color: '#ffff00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      ctx.strokeRect(cx - 10, cy - 10, 20, 20);
      // Flechas de luz
      ctx.beginPath(); ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 8, cy - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx + 8, cy); ctx.stroke();
      // Puntas flecha
      ctx.beginPath(); ctx.moveTo(cx + 5, cy - 10); ctx.lineTo(cx + 8, cy - 8); ctx.lineTo(cx + 5, cy - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // --- Aislador de Señal Analógica (T41 Phoenix MCR-SL-U-U) ---
  signal_isolator: {
    category: 'control',
    name: 'Aislador Señal (T)',
    prefix: 'T',
    color: '#88aaff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      // Doble barra aislamiento
      ctx.beginPath(); ctx.moveTo(cx - 2, cy - 10); ctx.lineTo(cx - 2, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 2, cy - 10); ctx.lineTo(cx + 2, cy + 10); ctx.stroke();
      // Flechas
      ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 4, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Switch Ethernet (A43 Phoenix SFN 5TXB) ---
  ethernet_switch: {
    category: 'comunicacion',
    name: 'Switch Ethernet (A)',
    prefix: 'A',
    color: '#44ff88',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 16); ctx.stroke();
      ctx.strokeRect(cx - 18, cy - 16, 36, 32);
      ctx.fillStyle = this.color; ctx.font = '8px Arial'; ctx.textAlign = 'center';
      ctx.fillText('ETH', cx, cy - 4);
      // 5 puertos
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - 14 + i * 7, cy + 4, 5, 6);
      }
      ctx.beginPath(); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 22, cy + 4);
    }
  },

  // --- Gateway Ethernet-CAN (A46 EMF2180IB) ---
  gateway: {
    category: 'comunicacion',
    name: 'Gateway ETH-CAN (A)',
    prefix: 'A',
    color: '#aa44ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.strokeRect(cx - 16, cy - 14, 32, 28);
      ctx.fillStyle = this.color; ctx.font = '7px Arial'; ctx.textAlign = 'center';
      ctx.fillText('ETH', cx - 6, cy); ctx.fillText('↔', cx, cy + 8); ctx.fillText('CAN', cx + 6, cy);
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },

  // --- Touch Screen / HMI (P3 Lenze EL 105) ---
  hmi: {
    category: 'comunicacion',
    name: 'HMI / Touch (P)',
    prefix: 'P',
    color: '#00ddff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 16); ctx.stroke();
      // Pantalla
      ctx.strokeRect(cx - 16, cy - 14, 32, 28);
      ctx.fillStyle = '#003344'; ctx.fillRect(cx - 12, cy - 10, 24, 18);
      ctx.fillStyle = this.color; ctx.font = '7px Arial'; ctx.textAlign = 'center';
      ctx.fillText('HMI', cx, cy + 1);
      ctx.beginPath(); ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 20, cy + 4);
    }
  },

  // --- Electroválvula Neumática (Y4 VQ4150 SMC) ---
  solenoid_valve: {
    category: 'actuador',
    name: 'Electroválvula (Y)',
    prefix: 'Y',
    color: '#ff66ff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Dos cuadrados juntos (posiciones)
      ctx.strokeRect(cx - 12, cy - 8, 12, 16);
      ctx.strokeRect(cx, cy - 8, 12, 16);
      // Flechas dirección
      ctx.beginPath(); ctx.moveTo(cx - 10, cy - 4); ctx.lineTo(cx - 4, cy); ctx.lineTo(cx - 10, cy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 10, cy + 4); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx + 10, cy - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Electromagneto (U33.4 MECALECTRO M941) ---
  electromagnet: {
    category: 'actuador',
    name: 'Electromagneto (U)',
    prefix: 'U',
    color: '#ff44aa',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Rectángulo con U (electromagneto)
      ctx.strokeRect(cx - 12, cy - 10, 24, 20);
      ctx.beginPath(); ctx.arc(cx, cy + 2, 6, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx - 6, cy + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(cx + 6, cy + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 16, cy + 4);
    }
  },

  // --- Columna Luminosa / Torre Señales (P35 LU7) ---
  signal_tower: {
    category: 'indicador',
    name: 'Torre Señales (P)',
    prefix: 'P',
    color: '#ffaa00',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 18); ctx.stroke();
      // Tres lámparas apiladas (R, Y, G)
      const colors = ['#ff0000', '#ffaa00', '#00ff00'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i]; ctx.globalAlpha = 0.7;
        ctx.fillRect(cx - 8, cy - 16 + i * 11, 16, 10);
        ctx.globalAlpha = 1;
        ctx.strokeRect(cx - 8, cy - 16 + i * 11, 16, 10);
      }
      ctx.beginPath(); ctx.moveTo(cx, cy + 17); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 12, cy + 4);
    }
  },

  // --- Iluminación Tablero (E5.1 PLAF 8W) ---
  cabinet_light: {
    category: 'indicador',
    name: 'Iluminación Tablero (E)',
    prefix: 'E',
    color: '#ffffaa',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Tubo fluorescente
      ctx.strokeRect(cx - 14, cy - 4, 28, 8);
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx - 4, cy - 12); ctx.stroke();
      ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy - 14); ctx.stroke();
      ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx + 4, cy - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Toma de Corriente / Enchufe (XS5.1 Vimar) ---
  power_outlet: {
    category: 'bornera',
    name: 'Toma Corriente (XS)',
    prefix: 'XS',
    color: '#aaffcc',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Círculo con dos pines
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
      // PE
      ctx.beginPath(); ctx.moveTo(cx - 3, cy + 5); ctx.lineTo(cx + 3, cy + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // --- Configurador de Seguridad (A28 XPSMC32ZC) ---
  safety_controller: {
    category: 'seguridad',
    name: 'Config. Seguridad (A)',
    prefix: 'A',
    color: '#ff2266',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 18); ctx.stroke();
      ctx.strokeRect(cx - 18, cy - 18, 36, 36);
      ctx.fillStyle = this.color; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
      ctx.fillText('XPS', cx, cy - 4); ctx.fillText('MC', cx, cy + 6);
      // Bordes de seguridad
      ctx.setLineDash([3, 2]); ctx.strokeRect(cx - 20, cy - 20, 40, 40); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(cx, cy + 18); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 24, cy + 4);
    }
  },

  // --- Interruptor Puerta (B20.1 Rittal PS4127) ---
  door_switch: {
    category: 'sensor',
    name: 'Int. Puerta (B)',
    prefix: 'B',
    color: '#88ddaa',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 10); ctx.stroke();
      // Puerta
      ctx.strokeRect(cx - 8, cy - 10, 16, 20);
      ctx.beginPath(); ctx.arc(cx + 4, cy, 2, 0, Math.PI * 2); ctx.stroke();
      // Flecha indicando apertura
      ctx.beginPath(); ctx.moveTo(cx + 8, cy - 6); ctx.lineTo(cx + 14, cy - 6); ctx.lineTo(cx + 12, cy - 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 18, cy + 4);
    }
  },

  // --- Presostato / Manómetro (S4.1 IS10E-30F03 SMC) ---
  pressure_switch: {
    category: 'sensor',
    name: 'Presostato (SP)',
    prefix: 'SP',
    color: '#88ccff',
    terminals: { top: true, bottom: true },
    draw(ctx, x, y, w, h, label) {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx, cy - 12); ctx.stroke();
      // Círculo con P
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = this.color; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.fillText('P', cx, cy + 4);
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, y + h - 8); ctx.stroke();
      ctx.fillStyle = ctx._labelColor || '#e0e0e0'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + 14, cy + 4);
    }
  },

  // ═══════════════════════════════════════════════════════
  // ⚡ FASE 3: BLACK BOX COMPONENTS (Multi-cell resizable)
  // ═══════════════════════════════════════════════════════

  // --- Generic Black Box (Base component for PLCs, VFDs, Panels) ---
  blackbox: {
    category: 'plc',
    name: 'Black Box Genérico',
    prefix: 'BB',
    color: '#00ff41',
    terminals: { custom: true }, // Will be defined per instance
    draw(ctx, x, y, w, h, label, component) {
      // Use actual width/height from component if available
      const actualW = component && component.width ? component.width * (w / 1) : w;
      const actualH = component && component.height ? component.height * (h / 1) : h;
      
      const cx = x + actualW / 2;
      const cy = y + actualH / 2;
      
      // Semi-transparent background
      ctx.fillStyle = 'rgba(30, 30, 40, 0.85)';
      ctx.fillRect(x, y, actualW, actualH);
      
      // Main border
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, actualW, actualH);
      
      // Inner border for depth effect
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, actualW - 4, actualH - 4);
      
      // Title centered at top
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, y + 8);
      
      // Type indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '9px Courier New';
      ctx.fillText('BLACK BOX', cx, y + 26);
      
      // Dimension indicator (bottom right)
      if (component && component.width && component.height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '8px Courier New';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${component.width}×${component.height}`, x + actualW - 4, y + actualH - 4);
      }
      
      // Reset alignment
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  },

  // --- VFD Template (Predefined Black Box) ---
  vfd_blackbox: {
    category: 'potencia',
    name: 'VFD (2×3 celdas)',
    prefix: 'VFD',
    color: '#ff8800',
    terminals: { custom: true },
    defaultWidth: 2,
    defaultHeight: 3,
    draw(ctx, x, y, w, h, label, component) {
      // Use actual width/height from component
      const actualW = component && component.width ? component.width * (w / 1) : w * 2;
      const actualH = component && component.height ? component.height * (h / 1) : h * 3;
      
      const cx = x + actualW / 2;
      const cy = y + actualH / 2;
      
      // VFD-specific background
      ctx.fillStyle = 'rgba(40, 25, 10, 0.9)';
      ctx.fillRect(x, y, actualW, actualH);
      
      // VFD border
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, actualW, actualH);
      
      // VFD display area
      ctx.fillStyle = '#001122';
      ctx.fillRect(x + 8, y + 30, actualW - 16, 25);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 8, y + 30, actualW - 16, 25);
      
      // Display text
      ctx.fillStyle = '#00ffaa';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('50.0Hz', cx, y + 45);
      
      // VFD title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, y + 15);
      
      // VFD type indicator
      ctx.fillStyle = this.color;
      ctx.font = '8px Courier New';
      ctx.fillText('FREQ. INVERTER', cx, cy + 25);
      
      // Heat sink visual
      for (let i = 0; i < 3; i++) {
        const lineX = x + 12 + i * 8;
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lineX, cy + 35);
        ctx.lineTo(lineX, y + actualH - 8);
        ctx.stroke();
      }
      
      // Reset alignment
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }
};

const CATEGORIES = [
  { id: 'proteccion', name: '🛡️ Protecciones', types: ['main_switch', 'breaker', 'fuse', 'motor_protection', 'thermal_relay', 'emc_filter', 'mccb', 'rccb'] },
  { id: 'control', name: '🔌 Control', types: ['contact_no', 'contact_nc', 'pushbutton', 'coil', 'relay', 'safety_module', 'thermostat', 'potentiometer', 'selector_switch', 'signal_isolator'] },
  { id: 'potencia', name: '⚡ Potencia', types: ['motor', 'vfd', 'soft_starter', 'contactron', 'transformer', 'fan', 'contactor', 'power_supply', 'brake_resistor', 'servo_drive', 'vfd_blackbox'] },
  { id: 'sensor', name: '📡 Sensores', types: ['proximity_sensor', 'photoelectric_sensor', 'door_switch', 'pressure_switch'] },
  { id: 'actuador', name: '🔧 Actuadores', types: ['solenoid_valve', 'electromagnet'] },
  { id: 'seguridad', name: '🔒 Seguridad', types: ['emergency_stop', 'safety_switch', 'safety_controller'] },
  { id: 'bornera', name: '🔩 Borneras/Conexiones', types: ['terminal_block', 'ground_bar', 'connector', 'power_outlet'] },
  { id: 'indicador', name: '💡 Indicadores', types: ['lamp', 'signal_tower', 'cabinet_light'] },
  { id: 'comunicacion', name: '🌐 Comunicación', types: ['ethernet_switch', 'gateway', 'hmi'] },
  { id: 'plc', name: '🖥️ PLC', types: ['plc_module', 'plc_blackbox'] },
  { id: 'blackbox', name: '📦 Black Box (FASE 3)', types: ['blackbox'] }
];

// ============================================
// ⚡ FASE 6: CROSS-REFERENCES AND IEC NOMENCLATURE
// ============================================

/**
 * IEC 750 / CEI 3-34 Nomenclature Constants
 * Format: =Product +Location -Component:Terminal
 */
const IEC_NOMENCLATURE = {
  // Product codes (machine types)
  PRODUCTS: {
    'SPH': 'Single Preheater',
    'MPH': 'Multiple Preheater', 
    'RS4': 'Rotary Shear',
    'TER': 'Terminal',
    'TWIN': 'Twin 400',
    'CRGM': 'Generic CRGM Machine'
  },
  
  // Location codes (cubicle/panel position)
  LOCATIONS: {
    '+M0': 'Documentation/Index',
    '+Q0': 'Main Electrical Panel',
    '+Q1': 'Motor Control Center',
    '+Q2': 'Distribution Panel', 
    '+SR': 'Safety/Emergency',
    '+W0': 'Cable List',
    '+P0': 'Parts List/BOM'
  },
  
  // Terminal types for cross-referencing
  TERMINAL_TYPES: {
    'coil': 'control_master',     // Bobinas son maestros
    'relay': 'control_master',    // Relés son maestros  
    'contact_no': 'control_slave', // Contactos son esclavos
    'contact_nc': 'control_slave',
    'pushbutton': 'control_slave',
    'breaker': 'power_master',    // Breakers/protecciones son maestros
    'motor_protection': 'power_master',
    'fuse': 'power_master'
  }
};

/**
 * Component relationship mapping for cross-references
 * Identifies parent-child relationships between electrical components
 */
const COMPONENT_RELATIONSHIPS = {
  // Master components (have slaves/contacts elsewhere)
  masters: ['coil', 'relay', 'breaker', 'motor_protection', 'fuse', 'main_switch', 'contactron'],
  
  // Slave components (controlled by masters)
  slaves: ['contact_no', 'contact_nc', 'pushbutton', 'emergency_stop', 'selector_switch']
};

// ============================================
// ⚡ FASE 6: IEC 81346 (ex IEC 750) NOMENCLATURE SYSTEM
// ============================================

/**
 * IEC 81346 (ex IEC 750) Nomenclature Parser and Generator
 * Structure: =Product +Location -Identifier :Terminal
 * Example: =4607 +Q0 -KA1 :13
 */
class IECNomenclature {
  constructor() {
    if (this.placingType) {
      // Place new component
      const def = IEC_COMPONENTS[this.placingType];
      if (!def) {
        this.statusEl.textContent = '❌ Tipo de componente no válido';
        return;
      }

      const width = def.defaultWidth || 1;
      const height = def.defaultHeight || 1;

      // Check if area is available
      if (!this._isAreaFree(col, row, width, height)) {
        this.statusEl.textContent = '⚠️ Posición ocupada o fuera de límites';
        return;
      }

      // Create new component
      const label = this._nextLabel(this.placingType);
      const comp = {
        id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: this.placingType,
        label: label,
        col: col,
        row: row,
        width: width,
        height: height,
        props: {}
      };

      this.components.push(comp);
      this.placingType = null;
      
      // Update palette state
      this.paletteEl.querySelectorAll('.de-palette-item').forEach(b => b.classList.remove('active'));
      
      this.statusEl.textContent = `✅ ${def.name} colocado: ${label} (${width}×${height}) en Col ${col + 1}, Fila ${row + 1}`;

      // Push to history after placing component
      this._pushHistory();

      // Auto-connect to component above (same column) - only for single-cell components
      if (width === 1 && height === 1) {
        const above = this._getComponentAt(col, row - 1);
        if (above) {
          const defAbove = IEC_COMPONENTS[above.type];
          if (defAbove && defAbove.terminals && defAbove.terminals.bottom && def.terminals && def.terminals.top) {
            const alreadyConnected = this.wires.find(w =>
              (w.from === above.id && w.to === comp.id) || (w.from === comp.id && w.to === above.id)
            );
            if (!alreadyConnected) {
              this.wires.push({
                id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                from: above.id,
                fromTerminal: 'bottom',
                to: comp.id,
                toTerminal: 'top',
                section: '1.5',
                color: 'Negro',
                cableType: 'H07V-K',
                length: ''
              });
              this.statusEl.textContent += ' 🔗 Auto-conectado';
            }
          }
        }
      }
      this._updateDeleteButton();
    } else {
      // Enhanced selection with Ctrl+Click for multiple selection
      const comp = this._getComponentAt(col, row);
      if (comp) {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Click: Toggle component in selection
          if (this.selectedComponents.has(comp.id)) {
            this.selectedComponents.delete(comp.id);
            this.statusEl.textContent = `➖ Deseleccionado: ${comp.label} (${this.selectedComponents.size} seleccionados)`;
          } else {
            this.selectedComponents.add(comp.id);
            this.statusEl.textContent = `➕ Seleccionado: ${comp.label} (${this.selectedComponents.size} seleccionados)`;
          }
        } else {
          // Normal click: Select only this component
          if (this.selectedComponents.size === 1 && this.selectedComponents.has(comp.id)) {
            // Already selected → deselect (toggle off)
            this.selectedComponents.clear();
            this.statusEl.textContent = '❌ Componente deseleccionado';
          } else {
            this.selectedComponents.clear();
            this.selectedComponents.add(comp.id);
          }
        }
      } else {
        // Click on empty space: deselect all
        this.selectedComponents.clear();
      }
      
      this._updateDeleteButton();
      this._updateInspectorForSelection();
    }
    
    this.render();
  }

}

// ============================================
// CLASE PRINCIPAL: DiagramEditor
// ============================================
class DiagramEditor {
  constructor(containerEl, diagram) {
    this.container = containerEl;
    this.diagram = diagram;

    // ⚡ FASE 6: IEC Nomenclature system
    this.iecNomenclature = new IECNomenclature();

    // Multi-page support
    this.pages = diagram.pages || [{
      id: 'page_1',
      name: 'Hoja 1',
      type: 'general',
      elements: diagram.elements || [],
      wires: diagram.wires || [],
      counters: diagram.counters || {},
      rows: diagram.rows || 12,
      busbars: diagram.busbars || [],
      busbarConnections: diagram.busbarConnections || []
    }];
    this.currentPageIndex = 0;
    this._syncCurrentPage();

    // Work mode
    this.workMode = diagram.workMode || 'edicion';

    // Canvas state
    this.COLS = 10;
    this.CELL_H = 60;
    this.CELL_W = 80;
    this.canvasW = this.CELL_W * this.COLS;
    this.canvasH = this.CELL_H * this.ROWS;

    // Enhanced interaction state
    this.selectedComponents = new Set();
    this.placingType = null;
    this.hoverCell = null;
    this.dragging = null;
    this._onSave = null;
    this._colors = {};

    // Mouse interaction state
    this.dragMode = null;
    this.resizeHandle = null;
    this.dragStartPos = null;
    this.dragStartComponents = null;
    
    // Clipboard system
    this.clipboard = [];

    // History system
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    // Legacy drag state
    this.draggedComponent = null;
    this.dragOffset = { x: 0, y: 0 };

    // Cable management
    this.cableCounter = diagram.cableCounter || 1;
    
    // Cross-references system
    this.crossReferences = new Map();
    this.showCrossReferences = true;

    // Build DOM
    this._buildDOM();

    // Setup canvas
    this.ctx = this.canvas.getContext('2d');

    // Bind events
    this._bindCanvasEvents();
    this._bindToolbarEvents();
    this._bindPageBarEvents();
    this._bindKeyboardShortcuts();

    // Render palette
    this._renderPalette();
    this._renderPageBar();

    // Initial render
    this._boundResize = () => this._handleResize();
    window.addEventListener('resize', this._boundResize);
    this._handleResize();

    // Save initial state
    this._pushHistory();

    this.statusEl.textContent = `✅ Editor listo — ${this.components.length} componentes`;
  }

  // ============================================
  // READONLY GETTER
  // ============================================
  get isReadonly() {
    const mode = WORK_MODES[this.workMode];
    return mode ? mode.readonly : false;
  }

  // ============================================
  // SYNC CURRENT PAGE
  // ============================================
  _syncCurrentPage() {
    const page = this.pages[this.currentPageIndex];
    if (!page) return;
    this.components = page.elements || [];
    this.wires = page.wires || [];
    this.counters = page.counters || {};
    this.ROWS = page.rows || 12;
    this.activeBusbars = page.busbars || [];
    this.busbarConnections = page.busbarConnections || [];
  }

  _saveCurrentPage() {
    const page = this.pages[this.currentPageIndex];
    if (!page) return;
    page.elements = this.components;
    page.wires = this.wires;
    page.counters = this.counters;
    page.rows = this.ROWS;
    page.busbars = this.activeBusbars || [];
    page.busbarConnections = this.busbarConnections || [];
  }

  // ============================================
  // BUILD DOM
  // ============================================
  _buildDOM() {
    const modeInfo = WORK_MODES[this.workMode] || WORK_MODES.edicion;

    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-height) - var(--status-bar-height) - 16px);overflow:hidden;">
        <!-- TOOLBAR -->
        <div class="de-toolbar">
          <button class="de-btn de-btn-back" data-action="back">← Volver</button>
          <span class="de-title">⚡ ${this._escHtml(this.diagram.name)}</span>
          <div class="de-toolbar-actions">
            <button class="de-btn" data-action="undo" title="Deshacer (Ctrl+Z)">↩️</button>
            <button class="de-btn" data-action="redo" title="Rehacer (Ctrl+Y)">↪️</button>
            <button class="de-btn" data-action="busbars" title="⚡ FASE 1: Gestionar Barras Horizontales">⚡ Barras</button>
            <button class="de-btn" data-action="titleblock">✏️ Cajetín</button>
            <button class="de-btn" data-action="xref">🔀 Ref.</button>
            <button class="de-btn" data-action="csv-export">📤 CSV</button>
            <button class="de-btn" data-action="csv-import">📥 CSV</button>
            <button class="de-btn" data-action="pdf">🖨️ PDF</button>
            <button class="de-btn de-btn-delete" data-action="delete" style="display:none;background:var(--color-danger-bg,#330000);color:var(--color-danger,#ff4444);border-color:var(--color-danger,#ff4444);" title="Eliminar componente seleccionado">🗑️ Eliminar</button>
            <button class="de-btn de-btn-save" data-action="save">💾 Guardar</button>
          </div>
        </div>

        <!-- MODE BAR -->
        <div class="de-mode-bar" id="de-mode-bar">
          <span class="de-mode-label">Modo:</span>
          <select class="de-mode-select">
            <option value="edicion" ${this.workMode === 'edicion' ? 'selected' : ''}>✏️ Edición</option>
            <option value="revision" ${this.workMode === 'revision' ? 'selected' : ''}>👁️ Revisión</option>
            <option value="finalizado" ${this.workMode === 'finalizado' ? 'selected' : ''}>🔒 Finalizado</option>
          </select>
          <span class="de-mode-indicator" style="color:${modeInfo.color}">${modeInfo.icon} ${modeInfo.name}</span>
        </div>

        <!-- MAIN AREA -->
        <div style="display:flex;flex:1;overflow:hidden;">
          <!-- SIDEBAR / PALETTE -->
          <div class="de-sidebar" id="de-palette"></div>

          <!-- CENTER: Canvas -->
          <div class="de-center">
            <div class="de-canvas-wrap" id="de-canvas-wrap">
              <canvas class="de-canvas" id="de-canvas"></canvas>
            </div>
            <!-- PAGE BAR -->
            <div class="de-page-bar" id="de-page-bar"></div>
            <!-- STATUS BAR -->
            <div class="de-status" id="de-status">Listo</div>
          </div>

          <!-- INSPECTOR -->
          <div class="de-inspector" id="de-inspector">
            <h3>Inspector</h3>
            <p class="de-inspector-empty">Selecciona un componente para inspeccionar sus propiedades.</p>
          </div>
        </div>
      </div>
    `;

    // Cache DOM refs
    this.canvas = this.container.querySelector('#de-canvas');
    this.inspectorEl = this.container.querySelector('#de-inspector');
    this.statusEl = this.container.querySelector('#de-status');
    this.pageBarEl = this.container.querySelector('#de-page-bar');
    this.modeIndicatorEl = this.container.querySelector('#de-mode-bar');
    this.paletteEl = this.container.querySelector('#de-palette');
    this.toolbarEl = this.container.querySelector('.de-toolbar');
    this.canvasWrapEl = this.container.querySelector('#de-canvas-wrap');
  }

  // Helper to escape HTML in template literals
  _escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ============================================
  // HANDLE CLICK EVENTS
  // ============================================
  _handleClick(e, col, row) {
    this.toolbarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;

      switch (action) {
        case 'back':
          if (window.CRGM && window.CRGM.navigate) window.CRGM.navigate('/diagrams');
          break;
        case 'undo':
          this.undo();
          break;
        case 'redo':
          this.redo();
          break;
        case 'save':
          this.save();
          break;
        case 'pdf':
          this.showPDFPreview();
          break;
        case 'csv-export':
          this.exportCSV();
          break;
        case 'csv-import':
          this.importCSV();
          break;
        case 'titleblock':
          this.editTitleBlock();
          break;
        case 'xref':
          this.showCrossReferences();
          break;
        case 'delete':
          this._deleteSelectedComponent();
          break;
        case 'busbars':
          this.configureBusbars();
          break;
      }
    });

    // Mode select
    const modeSelect = this.modeIndicatorEl.querySelector('.de-mode-select');
    if (modeSelect) {
      modeSelect.addEventListener('change', () => {
        this._setWorkMode(modeSelect.value);
      });
    }
  }

  // ============================================
  // PAGE BAR EVENTS
  // ============================================
  _bindPageBarEvents() {
    this.pageBarEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.de-page-tab');
      const del = e.target.closest('.de-page-del');
      const add = e.target.closest('.de-page-add');

      if (del) {
        e.stopPropagation();
        this.deletePage(parseInt(del.dataset.index));
        return;
      }
      if (tab) {
        this.switchPage(parseInt(tab.dataset.index));
        return;
      }
      if (add) {
        this.addPage();
        return;
      }
    });
  }

  // ============================================
  // ⚡ FASE 5: ENHANCED KEYBOARD SHORTCUTS
  // ============================================
  _bindKeyboardShortcuts() {
    this._boundKeyHandler = (e) => {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Ctrl+Z or Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }
      // Ctrl+Y or Cmd+Shift+Z = Redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.redo();
      }
      // ⚡ FASE 5: Ctrl+C = Copy selection
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        this._copySelection();
      }
      // ⚡ FASE 5: Ctrl+V = Paste
      else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !this.isReadonly) {
        e.preventDefault();
        this._pasteFromClipboard();
      }
      // ⚡ FASE 5: Ctrl+D = Duplicate selection
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !this.isReadonly) {
        e.preventDefault();
        this._duplicateSelection();
      }
      // ⚡ FASE 5: Ctrl+A = Select all
      else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this._selectAll();
      }
      // Delete or Backspace = Delete selected components
      else if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedComponents.size > 0 && !this.isReadonly) {
        e.preventDefault();
        this._deleteSelectedComponent();
      }
      // ⚡ FASE 5: Arrow keys = Nudge selected components
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && this.selectedComponents.size > 0 && !this.isReadonly) {
        e.preventDefault();
        this._nudgeSelection(e.key, e.shiftKey ? 5 : 1); // Shift = fast nudge
      }
      // Escape = Deselect / Cancel placing
      else if (e.key === 'Escape') {
        if (this.placingType) {
          this.placingType = null;
          this.paletteEl.querySelectorAll('.de-palette-item').forEach(b => b.classList.remove('active'));
          this.statusEl.textContent = '❌ Colocación cancelada';
        } else if (this.selectedComponents.size > 0) {
          this.selectedComponents.clear();
          this._renderInspectorEmpty();
          this._updateDeleteButton();
          this.statusEl.textContent = '❌ Selección cancelada';
        }
        this.render();
      }
    };

    window.addEventListener('keydown', this._boundKeyHandler);
  }

  // ============================================
  // CANVAS EVENT HANDLERS
  // ============================================
  _bindCanvasEvents() {
    // ⚡ FASE 7: Zoom with mouse wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -1 : 1;
      // Note: _handleZoom and _handlePanStart methods would need to be implemented
      // For now, we'll skip zoom/pan to fix the immediate error
    }, { passive: false });
    
    // Mouse down - Start drag operation or resize
    this.canvas.addEventListener('mousedown', (e) => {
      // ⚡ FASE 7: Pan with middle-click or Ctrl+Left-click
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        e.preventDefault();
        return;
      }
      if (this.isReadonly) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / this.CELL_W);
      const row = Math.floor(y / this.CELL_H);

      // Check if clicking on a resize handle first
      const resizeInfo = this._getResizeHandleAt(x, y);
      if (resizeInfo && !this.placingType) {
        this.dragMode = 'resize';
        this.resizeHandle = resizeInfo.handle;
        this.dragStartPos = { x, y, col, row };
        this.dragStartComponents = { [resizeInfo.component.id]: { ...resizeInfo.component } };
        this.canvas.style.cursor = this._getResizeCursor(resizeInfo.handle);
        e.preventDefault();
        return;
      }

      // Check if clicking on a selected component for dragging
      const comp = this._getComponentAt(col, row);
      if (comp && this.selectedComponents.has(comp.id) && !this.placingType) {
        this.dragMode = 'move';
        this.dragStartPos = { x, y, col, row };
        this.dragStartComponents = this._snapshotSelectedComponents();
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
        return;
      }

      // Otherwise, prepare for potential click selection
      this.dragMode = 'select';
      this.dragStartPos = { x, y, col, row };
    });

    // Mouse move - Handle dragging and resize operations
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / this.CELL_W);
      const row = Math.floor(y / this.CELL_H);

      // Handle active drag operations
      if (this.dragMode === 'resize' && this.dragStartPos) {
        this._handleResize(x, y);
        return;
      }

      if (this.dragMode === 'move' && this.dragStartPos) {
        this._handleMove(col, row);
        return;
      }

      // Update hover cell for placement preview
      if (col >= 0 && col < this.COLS && row >= 0 && row < this.ROWS) {
        this.hoverCell = { col, row };
      } else {
        this.hoverCell = null;
      }

      // Update cursor based on what's under mouse
      if (!this.dragMode) {
        const resizeInfo = this._getResizeHandleAt(x, y);
        if (resizeInfo) {
          this.canvas.style.cursor = this._getResizeCursor(resizeInfo.handle);
        } else {
          const comp = this._getComponentAt(col, row);
          if (comp && this.selectedComponents.has(comp.id)) {
            this.canvas.style.cursor = this.placingType ? 'crosshair' : 'grab';
          } else {
            this.canvas.style.cursor = this.placingType ? 'crosshair' : 'default';
          }
        }
      }

      this.render();
    });

    // Mouse up - Complete drag operations or handle click selection
    this.canvas.addEventListener('mouseup', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / this.CELL_W);
      const row = Math.floor(y / this.CELL_H);

      if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) {
        this._resetDragState();
        return;
      }

      // Complete drag operations
      if (this.dragMode === 'resize') {
        this._completeResize();
        this._resetDragState();
        return;
      }

      if (this.dragMode === 'move') {
        this._completeMove();
        this._resetDragState();
        return;
      }

      // Handle click selection (only if we didn't drag)
      if (this.dragMode === 'select') {
        const dragDistance = Math.sqrt(
          Math.pow(x - this.dragStartPos.x, 2) + 
          Math.pow(y - this.dragStartPos.y, 2)
        );
        
        // Only treat as click if mouse didn't move much
        if (dragDistance < 5) {
          this._handleClick(e, col, row);
        }
      }

      this._resetDragState();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverCell = null;
      this._resetDragState();
      this.render();
    });

    // Right click to delete
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.isReadonly) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / this.CELL_W);
      const row = Math.floor(y / this.CELL_H);

      const comp = this._getComponentAt(col, row);
      if (comp) {
        if (confirm(`¿Eliminar ${comp.label}?`)) {
          this.components = this.components.filter(c => c.id !== comp.id);
          this.wires = this.wires.filter(w => w.from !== comp.id && w.to !== comp.id);
          if (this.selectedComponents.has(comp.id)) {
            this.selectedComponents.delete(comp.id);
            this._updateInspectorForSelection();
          }
          this._pushHistory();
          this.statusEl.textContent = `🗑️ ${comp.label} eliminado`;
          this.render();
        }
      }
    });
  }

  // ============================================
  // HELPER METHODS FOR DRAG OPERATIONS
  // ============================================
  
  _resetDragState() {
    this.dragMode = null;
    this.resizeHandle = null;
    this.dragStartPos = null;
    this.dragStartComponents = null;
    this.canvas.style.cursor = this.placingType ? 'crosshair' : 'default';
  }

  _snapshotSelectedComponents() {
    const snapshot = {};
    this.selectedComponents.forEach(compId => {
      const comp = this.components.find(c => c.id === compId);
      if (comp) {
        snapshot[compId] = { col: comp.col, row: comp.row, width: comp.width || 1, height: comp.height || 1 };
      }
    });
    return snapshot;
  }

  _getResizeHandleAt(x, y) {
    // Check if we're clicking on a resize handle of a selected component
    for (const compId of this.selectedComponents) {
      const comp = this.components.find(c => c.id === compId);
      if (!comp || (comp.width || 1) === 1 && (comp.height || 1) === 1) continue;

      const compX = comp.col * this.CELL_W;
      const compY = comp.row * this.CELL_H;
      const compW = (comp.width || 1) * this.CELL_W;
      const compH = (comp.height || 1) * this.CELL_H;
      
      const handleSize = 8;
      const handles = [
        { x: compX + compW - handleSize/2, y: compY + compH - handleSize/2, handle: 'br' },
        { x: compX + compW - handleSize/2, y: compY + compH/2 - handleSize/2, handle: 'r' },
        { x: compX + compW/2 - handleSize/2, y: compY + compH - handleSize/2, handle: 'b' }
      ];

      for (const h of handles) {
        if (x >= h.x && x <= h.x + handleSize && y >= h.y && y <= h.y + handleSize) {
          return { component: comp, handle: h.handle };
        }
      }
    }
    return null;
  }

  _getResizeCursor(handle) {
    switch (handle) {
      case 'br': return 'nwse-resize';
      case 'r': return 'ew-resize';
      case 'b': return 's-resize';
      default: return 'default';
    }
  }

  // ============================================
  // ⚡ HISTORY SYSTEM (Undo/Redo)
  // ============================================
  _pushHistory() {
    // Create snapshot of current state
    const state = {
      components: JSON.parse(JSON.stringify(this.components)),
      wires: JSON.parse(JSON.stringify(this.wires)),
      counters: JSON.parse(JSON.stringify(this.counters))
    };

    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add new state
    this.history.push(state);
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex <= 0) {
      this.statusEl.textContent = '⚠️ No hay más acciones para deshacer';
      return;
    }

    this.historyIndex--;
    this._restoreHistory();
    this.statusEl.textContent = `↩️ Deshacer (${this.historyIndex + 1}/${this.history.length})`;
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      this.statusEl.textContent = '⚠️ No hay más acciones para rehacer';
      return;
    }

    this.historyIndex++;
    this._restoreHistory();
    this.statusEl.textContent = `↪️ Rehacer (${this.historyIndex + 1}/${this.history.length})`;
  }

  _restoreHistory() {
    if (this.historyIndex < 0 || this.historyIndex >= this.history.length) return;

    const state = this.history[this.historyIndex];
    this.components = JSON.parse(JSON.stringify(state.components));
    this.wires = JSON.parse(JSON.stringify(state.wires));
    this.counters = JSON.parse(JSON.stringify(state.counters));

    // Clear selection
    this.selectedComponents.clear();
    this._updateInspectorForSelection();
    this._updateDeleteButton();
    
    // Re-render
    this.render();
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  _getComponentAt(col, row) {
    return this.components.find(c => {
      const w = c.width || 1;
      const h = c.height || 1;
      return col >= c.col && col < c.col + w && row >= c.row && row < c.row + h;
    });
  }

  _isAreaFree(col, row, width, height, excludeId = null) {
    // Check bounds
    if (col < 0 || row < 0 || col + width > this.COLS || row + height > this.ROWS) {
      return false;
    }

    // Check for overlapping components
    for (let c = col; c < col + width; c++) {
      for (let r = row; r < row + height; r++) {
        const existing = this._getComponentAt(c, r);
        if (existing && existing.id !== excludeId) {
          return false;
        }
      }
    }

    return true;
  }

  _nextLabel(type) {
    const def = IEC_COMPONENTS[type];
    if (!def) return 'C1';
    const prefix = def.prefix;
    if (!this.counters[prefix]) this.counters[prefix] = 0;
    this.counters[prefix]++;
    return `${prefix}${this.counters[prefix]}`;
  }

  _refreshColors() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    this._colors = {
      bg: style.getPropertyValue('--color-bg').trim() || '#0a0a0f',
      grid: style.getPropertyValue('--color-border').trim() || '#1a1a2e',
      border: style.getPropertyValue('--color-border').trim() || '#333',
      text: style.getPropertyValue('--color-text').trim() || '#e0e0e0',
      success: style.getPropertyValue('--color-success').trim() || '#00ff41'
    };
  }

  // ⚡ FASE 2: Get terminal position on canvas
  _getTerminalPosition(comp, terminalId) {
    if (!comp || !terminalId) return null;

    const schema = COMPONENT_TERMINAL_SCHEMA[comp.type];
    if (!schema || !schema.terminals || !schema.terminals[terminalId]) {
      // Fallback to simple top/bottom terminals
      const x = comp.col * this.CELL_W + this.CELL_W / 2;
      if (terminalId === 'top') {
        return { x, y: comp.row * this.CELL_H + 8, terminal: 'top' };
      } else if (terminalId === 'bottom') {
        return { x, y: comp.row * this.CELL_H + this.CELL_H - 8, terminal: 'bottom' };
      }
      return null;
    }

    const terminal = schema.terminals[terminalId];
    const compX = comp.col * this.CELL_W;
    const compY = comp.row * this.CELL_H;
    const compW = this.CELL_W;
    const compH = this.CELL_H;

    let x, y;

    switch (terminal.side) {
      case 'top':
        x = compX + compW / 2 + (terminal.offset * compW);
        y = compY + 8;
        break;
      case 'bottom':
        x = compX + compW / 2 + (terminal.offset * compW);
        y = compY + compH - 8;
        break;
      case 'left':
        x = compX + 8;
        y = compY + compH / 2 + (terminal.offset * compH);
        break;
      case 'right':
        x = compX + compW - 8;
        y = compY + compH / 2 + (terminal.offset * compH);
        break;
      default:
        return null;
    }

    return { x, y, terminal: terminalId, side: terminal.side, type: terminal.type };
  }

  // ⚡ FASE 2: Get all terminals for a component
  _getComponentTerminals(comp) {
    if (!comp) return [];

    const schema = COMPONENT_TERMINAL_SCHEMA[comp.type];
    if (!schema || !schema.terminals) return [];

    return Object.entries(schema.terminals).map(([id, term]) => ({
      id,
      label: term.label,
      side: term.side,
      type: term.type
    }));
  }

  // ⚡ FASE 4: Generate unique cable label
  _generateCableLabel() {
    const label = `W${this.cableCounter}`;
    this.cableCounter++;
    return label;
  }

  // ⚡ FASE 4: Calculate orthogonal wire route
  _calculateWireRoute(fromPos, toPos, fromTerminal, toTerminal) {
    // Simple orthogonal routing with one bend
    const route = [
      { x: fromPos.x, y: fromPos.y }
    ];

    // Add intermediate point for orthogonal routing
    if (Math.abs(fromPos.x - toPos.x) > 10 && Math.abs(fromPos.y - toPos.y) > 10) {
      // L-shaped route
      const midY = (fromPos.y + toPos.y) / 2;
      route.push({ x: fromPos.x, y: midY });
      route.push({ x: toPos.x, y: midY });
    }

    route.push({ x: toPos.x, y: toPos.y });
    return route;
  }

  // ⚡ FASE 4: Draw wire along route
  _drawWireRoute(ctx, route, wire, color) {
    if (route.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(route[0].x, route[0].y);
    
    for (let i = 1; i < route.length; i++) {
      ctx.lineTo(route[i].x, route[i].y);
    }
    
    ctx.stroke();

    // Draw connection dots
    ctx.fillStyle = color;
    route.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ⚡ FASE 4: Draw cable label
  _drawCableLabel(ctx, route, wire, color) {
    if (route.length < 2) return;

    const midPoint = route[Math.floor(route.length / 2)];
    const section = wire.section || '1.5';
    const cableType = wire.cableType || 'H07V-K';
    const label = wire.cableLabel || `W${this.wires.indexOf(wire) + 1}`;

    ctx.fillStyle = this._colors.bg;
    ctx.fillRect(midPoint.x - 20, midPoint.y - 10, 40, 14);

    ctx.fillStyle = color;
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${label}: ${section}mm²`, midPoint.x, midPoint.y);
  }

  // ⚡ FASE 4: Get wire color by IEC name
  _getWireColorByName(colorName) {
    const found = Object.values(IEC_WIRE_COLORS).find(c => 
      c.name.toLowerCase() === colorName.toLowerCase() || 
      c.code === colorName
    );
    return found || { hex: '#00ff41', name: colorName };
  }

  // ============================================
  // ⚡ FASE 6: IEC 750/81346 NOMENCLATURE SYSTEM
  // ============================================

  constructor() {
    this.PRODUCT_PREFIXES = {
      '4607': 'Corrugadora TWIN400/TERMINAL400',
      'SPH1': 'Single Preheater B.0',
      'ARS4': 'Rotary Shear',
      'ATW4': 'Slitter',
      'CRGM': 'Sistema CRGM'
    };
    
    this.LOCATION_CODES = {
      'M0': 'Portada / Índice',
      'Q0': 'Cuadro eléctrico general',
      'Q1': 'Cuadro auxiliar 1',
      'Q2': 'Cuadro auxiliar 2',
      'W0': 'Resumen de cables',
      'P0': 'Lista de materiales',
      'SR': 'Sistema de seguridad'
    };
    
    this.COMPONENT_FAMILIES = {
      // Protección
      'QS': { family: 'protection', description: 'Interruptor seccionador', isParent: true },
      'QF': { family: 'protection', description: 'Disyuntor', isParent: true },
      'FU': { family: 'protection', description: 'Fusible', isParent: true },
      'QM': { family: 'protection', description: 'Guardamotor', isParent: true },
      'F': { family: 'protection', description: 'Relé térmico', isParent: true },
      
      // Control
      'KM': { family: 'control', description: 'Contactor', isParent: true },
      'KA': { family: 'control', description: 'Relé auxiliar', isParent: true },
      'K': { family: 'control', description: 'Relé', isParent: true },
      'SB': { family: 'control', description: 'Pulsador', isChild: true, parentFamily: ['KM', 'KA', 'K'] },
      'S': { family: 'control', description: 'Interruptor', isChild: true, parentFamily: ['KM', 'KA', 'K'] },
      
      // Potencia
      'M': { family: 'power', description: 'Motor', isChild: true, parentFamily: ['KM', 'QF', 'QM'] },
      'T': { family: 'power', description: 'Transformador/VFD', isParent: true },
      
      // Indicadores
      'H': { family: 'indication', description: 'Lámpara', isChild: true, parentFamily: ['KA', 'K'] },
      'P': { family: 'indication', description: 'Señalización', isChild: true, parentFamily: ['KA', 'K'] },
      
      // Sensores
      'B': { family: 'sensor', description: 'Sensor', isChild: true, parentFamily: ['KA', 'K'] },
      'SP': { family: 'sensor', description: 'Presostato', isChild: true, parentFamily: ['KA', 'K'] },
      
      // Actuadores
      'Y': { family: 'actuator', description: 'Electroválvula', isChild: true, parentFamily: ['KM', 'KA'] },
      'U': { family: 'actuator', description: 'Electromagneto', isChild: true, parentFamily: ['KM', 'KA'] },
      
      // Borneras
      'X': { family: 'terminal', description: 'Bornera', isNeutral: true },
      'XS': { family: 'terminal', description: 'Toma corriente', isNeutral: true },
      'XB': { family: 'terminal', description: 'Conector', isNeutral: true },
      'PE': { family: 'terminal', description: 'Tierra', isNeutral: true }
    };
  }
  
  /**
   * Parse IEC nomenclature string into components
   * @param {string} nomenclature - Full IEC nomenclature
   * @returns {Object} - Parsed components
   */
  parse(nomenclature) {
    if (!nomenclature) return null;
    
    const regex = /^(?:=([^+]+))?(?:\+([^-]+))?(?:-([^:]+))?(?::(.+))?$/;
    const match = nomenclature.match(regex);
    
    if (!match) return null;
    
    return {
      product: match[1] || '',
      location: match[2] || '',
      identifier: match[3] || '',
      terminal: match[4] || '',
      full: nomenclature
    };
  }
  
  /**
   * Generate IEC nomenclature from components
   * @param {Object} components - {product, location, identifier, terminal}
   * @returns {string} - Full IEC nomenclature
   */
  generate(components) {
    let result = '';
    if (components.product) result += `=${components.product}`;
    if (components.location) result += `+${components.location}`;
    if (components.identifier) result += `-${components.identifier}`;
    if (components.terminal) result += `:${components.terminal}`;
    return result;
  }
  
  /**
   * Get component family information
   * @param {string} label - Component label (e.g., 'KA1', 'SB2')
   * @returns {Object} - Family info
   */
  getComponentFamily(label) {
    if (!label) return null;
    
    // Extract prefix (letters at the start)
    const prefixMatch = label.match(/^([A-Z]+)/);
    if (!prefixMatch) return null;
    
    const prefix = prefixMatch[1];
    return this.COMPONENT_FAMILIES[prefix] || null;
  }
  
  /**
   * Check if two components are related (parent-child relationship)
   * @param {string} label1 - First component label
   * @param {string} label2 - Second component label
   * @returns {Object} - Relationship info
   */
  getRelationship(label1, label2) {
    const family1 = this.getComponentFamily(label1);
    const family2 = this.getComponentFamily(label2);
    
    if (!family1 || !family2) return null;
    
    // Extract base identifiers (without suffixes)
    const base1 = this.getBaseIdentifier(label1);
    const base2 = this.getBaseIdentifier(label2);
    
    // Must have same base identifier to be related
    if (base1 !== base2) return null;
    
    // Check parent-child relationships
    if (family1.isParent && family2.isChild && family2.parentFamily?.includes(this.getPrefix(label1))) {
      return { type: 'parent-child', parent: label1, child: label2 };
    }
    
    if (family2.isParent && family1.isChild && family1.parentFamily?.includes(this.getPrefix(label2))) {
      return { type: 'parent-child', parent: label2, child: label1 };
    }
    
    // Check if both are children of same family (siblings)
    if (family1.isChild && family2.isChild && 
        family1.parentFamily?.some(p => family2.parentFamily?.includes(p))) {
      return { type: 'siblings', components: [label1, label2] };
    }
    
    return null;
  }
  
  /**
   * Get component prefix (letters only)
   * @param {string} label - Component label
   * @returns {string} - Prefix
   */
  getPrefix(label) {
    const match = label.match(/^([A-Z]+)/);
    return match ? match[1] : '';
  }
  
  /**
   * Get base identifier (removes contact suffixes like .1, .2, etc.)
   * @param {string} label - Component label
   * @returns {string} - Base identifier
   */
  getBaseIdentifier(label) {
    // Remove contact suffixes (.13, .14, etc.) and keep base (KA1, KM2, etc.)
    return label.replace(/\.\d+$/, '');
  }
  
  /**
   * Validate IEC nomenclature
   * @param {string} nomenclature - Nomenclature to validate
   * @returns {Object} - Validation result
   */
  validate(nomenclature) {
    const parsed = this.parse(nomenclature);
    const errors = [];
    const warnings = [];
    
    if (!parsed) {
      errors.push('Formato de nomenclatura inválido');
      return { valid: false, errors, warnings };
    }
    
    // Check product code
    if (parsed.product && !this.PRODUCT_PREFIXES[parsed.product]) {
      warnings.push(`Código de producto '${parsed.product}' no reconocido`);
    }
    
    // Check location code
    if (parsed.location && !this.LOCATION_CODES[parsed.location]) {
      warnings.push(`Código de ubicación '${parsed.location}' no reconocido`);
    }
    
    // Check identifier family
    if (parsed.identifier) {
      const family = this.getComponentFamily(parsed.identifier);
      if (!family) {
        warnings.push(`Identificador '${parsed.identifier}' no corresponde a una familia conocida`);
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
}

  // ============================================
  // TOOLBAR EVENTS
  // ============================================
  _bindToolbarEvents() {
    this.container = containerEl;
    this.diagram = diagram;

    // ⚡ FASE 6: IEC Nomenclature system
    this.iecNomenclature = new IECNomenclature();

    // Multi-page support
    this.pages = diagram.pages || [{
      id: 'page_1',
      name: 'Hoja 1',
      type: 'general',
      elements: diagram.elements || [],
      wires: diagram.wires || [],
      counters: diagram.counters || {},
      rows: diagram.rows || 12,
      busbars: diagram.busbars || [],
      busbarConnections: diagram.busbarConnections || []
    }];
    this.currentPageIndex = 0;
    this._syncCurrentPage();

    // Work mode
    this.workMode = diagram.workMode || 'edicion';

    // Canvas state
    this.COLS = 10;
    this.CELL_H = 60;
    this.CELL_W = 80;
    this.canvasW = this.CELL_W * this.COLS;
    this.canvasH = this.CELL_H * this.ROWS;

    // Enhanced interaction state
    this.selectedComponents = new Set();
    this.placingType = null;
    this.hoverCell = null;
    this.dragging = null;
    this._onSave = null;
    this._colors = {};

    // Mouse interaction state
    this.dragMode = null;
    this.resizeHandle = null;
    this.dragStartPos = null;
    this.dragStartComponents = null;
    
    // Clipboard system
    this.clipboard = [];

    // History system
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    // Legacy drag state
    this.draggedComponent = null;
    this.dragOffset = { x: 0, y: 0 };

    // Cable management
    this.cableCounter = diagram.cableCounter || 1;
    
    // Cross-references system
    this.crossReferences = new Map();
    this.showCrossReferences = true;

    // Build DOM
    this._buildDOM();

    // Setup canvas
    this.ctx = this.canvas.getContext('2d');

    // Bind events
    this._bindCanvasEvents();
    this._bindToolbarEvents();
    this._bindPageBarEvents();
    this._bindKeyboardShortcuts();

    // Render palette
    this._renderPalette();
    this._renderPageBar();

    // Initial render
    this._boundResize = () => this._handleResize();
    window.addEventListener('resize', this._boundResize);
    this._handleResize();

    // Save initial state
    this._pushHistory();

    this.statusEl.textContent = `✅ Editor listo — ${this.components.length} componentes`;
  }

  // ============================================
  // READONLY GETTER
  // ============================================
  get isReadonly() {
    const mode = WORK_MODES[this.workMode];
    return mode ? mode.readonly : false;
  }

  // ============================================
  // SYNC CURRENT PAGE
  // ============================================
  _syncCurrentPage() {
    const page = this.pages[this.currentPageIndex];
    if (!page) return;
    this.components = page.elements || [];
    this.wires = page.wires || [];
    this.counters = page.counters || {};
    this.ROWS = page.rows || 12;
    this.activeBusbars = page.busbars || [];
    this.busbarConnections = page.busbarConnections || [];
  }

  _saveCurrentPage() {
    const page = this.pages[this.currentPageIndex];
    if (!page) return;
    page.elements = this.components;
    page.wires = this.wires;
    page.counters = this.counters;
    page.rows = this.ROWS;
    page.busbars = this.activeBusbars || [];
    page.busbarConnections = this.busbarConnections || [];
  }

  // ============================================
  // BUILD DOM
  // ============================================
  _buildDOM() {
    const modeInfo = WORK_MODES[this.workMode] || WORK_MODES.edicion;

    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-height) - var(--status-bar-height) - 16px);overflow:hidden;">
        <!-- TOOLBAR -->
        <div class="de-toolbar">
          <button class="de-btn de-btn-back" data-action="back">← Volver</button>
          <span class="de-title">⚡ ${this._escHtml(this.diagram.name)}</span>
          <div class="de-toolbar-actions">
            <button class="de-btn" data-action="undo" title="Deshacer (Ctrl+Z)">↩️</button>
            <button class="de-btn" data-action="redo" title="Rehacer (Ctrl+Y)">↪️</button>
            <button class="de-btn" data-action="busbars" title="⚡ FASE 1: Gestionar Barras Horizontales">⚡ Barras</button>
            <button class="de-btn" data-action="titleblock">✏️ Cajetín</button>
            <button class="de-btn" data-action="xref">🔀 Ref.</button>
            <button class="de-btn" data-action="csv-export">📤 CSV</button>
            <button class="de-btn" data-action="csv-import">📥 CSV</button>
            <button class="de-btn" data-action="pdf">🖨️ PDF</button>
            <button class="de-btn de-btn-delete" data-action="delete" style="display:none;background:var(--color-danger-bg,#330000);color:var(--color-danger,#ff4444);border-color:var(--color-danger,#ff4444);" title="Eliminar componente seleccionado">🗑️ Eliminar</button>
            <button class="de-btn de-btn-save" data-action="save">💾 Guardar</button>
          </div>
        </div>

        <!-- MODE BAR -->
        <div class="de-mode-bar" id="de-mode-bar">
          <span class="de-mode-label">Modo:</span>
          <select class="de-mode-select">
            <option value="edicion" ${this.workMode === 'edicion' ? 'selected' : ''}>✏️ Edición</option>
            <option value="revision" ${this.workMode === 'revision' ? 'selected' : ''}>👁️ Revisión</option>
            <option value="finalizado" ${this.workMode === 'finalizado' ? 'selected' : ''}>🔒 Finalizado</option>
          </select>
          <span class="de-mode-indicator" style="color:${modeInfo.color}">${modeInfo.icon} ${modeInfo.name}</span>
        </div>

        <!-- MAIN AREA -->
        <div style="display:flex;flex:1;overflow:hidden;">
          <!-- SIDEBAR / PALETTE -->
          <div class="de-sidebar" id="de-palette"></div>

          <!-- CENTER: Canvas -->
          <div class="de-center">
            <div class="de-canvas-wrap" id="de-canvas-wrap">
              <canvas class="de-canvas" id="de-canvas"></canvas>
            </div>
            <!-- PAGE BAR -->
            <div class="de-page-bar" id="de-page-bar"></div>
            <!-- STATUS BAR -->
            <div class="de-status" id="de-status">Listo</div>
          </div>

          <!-- INSPECTOR -->
          <div class="de-inspector" id="de-inspector">
            <h3>Inspector</h3>
            <p class="de-inspector-empty">Selecciona un componente para inspeccionar sus propiedades.</p>
          </div>
        </div>
      </div>
    `;

    // Cache DOM refs
    this.canvas = this.container.querySelector('#de-canvas');
    this.inspectorEl = this.container.querySelector('#de-inspector');
    this.statusEl = this.container.querySelector('#de-status');
    this.pageBarEl = this.container.querySelector('#de-page-bar');
    this.modeIndicatorEl = this.container.querySelector('#de-mode-bar');
    this.paletteEl = this.container.querySelector('#de-palette');
    this.toolbarEl = this.container.querySelector('.de-toolbar');
    this.canvasWrapEl = this.container.querySelector('#de-canvas-wrap');
  }

  // Helper to escape HTML in template literals
  _escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /**
   * Handle resize dragging operation
   * @param {number} x - Current mouse X
   * @param {number} y - Current mouse Y
   */
  _handleResize(x, y) {
    if (!this.dragStartPos || !this.dragStartComponents || !this.resizeHandle) return;

    const deltaX = x - this.dragStartPos.x;
    const deltaY = y - this.dragStartPos.y;
    
    // Get the component being resized (should be only one for resize)
    const compId = Object.keys(this.dragStartComponents)[0];
    const comp = this.components.find(c => c.id === compId);
    if (!comp) return;

    const originalData = this.dragStartComponents[compId];
    let newWidth = originalData.width;
    let newHeight = originalData.height;

    // Calculate new dimensions based on handle type and mouse delta
    const cellDeltaX = Math.round(deltaX / this.CELL_W);
    const cellDeltaY = Math.round(deltaY / this.CELL_H);

    switch (this.resizeHandle) {
      case 'br': // Bottom-right: both width and height
        newWidth = Math.max(1, originalData.width + cellDeltaX);
        newHeight = Math.max(1, originalData.height + cellDeltaY);
        break;
      case 'r': // Right: only width
        newWidth = Math.max(1, originalData.width + cellDeltaX);
        break;
      case 'b': // Bottom: only height
        newHeight = Math.max(1, originalData.height + cellDeltaY);
        break;
    }

    // Check bounds
    if (comp.col + newWidth > this.COLS || comp.row + newHeight > this.ROWS) {
      return; // Don't resize beyond grid bounds
    }

    // Check for collisions (excluding the component itself)
    if (!this._isAreaFree(comp.col, comp.row, newWidth, newHeight, comp.id)) {
      return; // Don't resize if it would collide
    }

    // Apply new dimensions
    comp.width = newWidth;
    comp.height = newHeight;

    // Update status
    this.statusEl.textContent = `📏 Redimensionando ${comp.label}: ${newWidth}×${newHeight} celdas`;
    
    this.render();
  }

  /**
   * Handle move dragging operation
   * @param {number} col - Current grid column
   * @param {number} row - Current grid row
   */
  _handleMove(col, row) {
    if (!this.dragStartPos || !this.dragStartComponents) return;

    const deltaCol = col - this.dragStartPos.col;
    const deltaRow = row - this.dragStartPos.row;

    if (deltaCol === 0 && deltaRow === 0) return; // No movement

    const selectedIds = Array.from(this.selectedComponents);
    let canMove = true;
    const newPositions = {};

    // Calculate new positions and check validity
    for (const compId of selectedIds) {
      const comp = this.components.find(c => c.id === compId);
      if (!comp) continue;

      const originalData = this.dragStartComponents[compId];
      const newCol = originalData.col + deltaCol;
      const newRow = originalData.row + deltaRow;
      const width = comp.width || 1;
      const height = comp.height || 1;

      // Check bounds
      if (newCol < 0 || newRow < 0 || 
          newCol + width > this.COLS || 
          newRow + height > this.ROWS) {
        canMove = false;
        break;
      }

      // Check for collisions (excluding selected components)
      if (!this._isAreaFree(newCol, newRow, width, height, comp.id)) {
        const collidingComp = this._getComponentAt(newCol, newRow);
        if (collidingComp && !selectedIds.includes(collidingComp.id)) {
          canMove = false;
          break;
        }
      }

      newPositions[compId] = { col: newCol, row: newRow };
    }

    if (!canMove) {
      // Show warning but don't move
      this.statusEl.textContent = '⚠️ No se puede mover - fuera de límites o colisión';
      return;
    }

    // Apply new positions
    for (const compId of selectedIds) {
      const comp = this.components.find(c => c.id === compId);
      if (comp && newPositions[compId]) {
        comp.col = newPositions[compId].col;
        comp.row = newPositions[compId].row;
      }
    }

    // Update status
    const movedCount = Object.keys(newPositions).length;
    this.statusEl.textContent = `⚡ Moviendo ${movedCount} elemento${movedCount > 1 ? 's' : ''} (${deltaCol > 0 ? '+' : ''}${deltaCol}, ${deltaRow > 0 ? '+' : ''}${deltaRow})`;
    
    this.render();
  }

  /**
   * Complete resize operation and push to history
   */
  _completeResize() {
    if (!this.dragStartPos || !this.dragStartComponents) return;

    // Check if dimensions actually changed
    let changed = false;
    for (const [compId, originalData] of Object.entries(this.dragStartComponents)) {
      const comp = this.components.find(c => c.id === compId);
      if (comp && (comp.width !== originalData.width || comp.height !== originalData.height)) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this._pushHistory();
      const compId = Object.keys(this.dragStartComponents)[0];
      const comp = this.components.find(c => c.id === compId);
      if (comp) {
        this.statusEl.textContent = `✅ ${comp.label} redimensionado a ${comp.width || 1}×${comp.height || 1} celdas`;
      }
    } else {
      this.statusEl.textContent = '❌ Sin cambios en las dimensiones';
    }
  }

  /**
   * Complete move operation and push to history
   */
  _completeMove() {
    if (!this.dragStartPos || !this.dragStartComponents) return;

    // Check if positions actually changed
    let changed = false;
    for (const [compId, originalData] of Object.entries(this.dragStartComponents)) {
      const comp = this.components.find(c => c.id === compId);
      if (comp && (comp.col !== originalData.col || comp.row !== originalData.row)) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this._pushHistory();
      const movedCount = Object.keys(this.dragStartComponents).length;
      this.statusEl.textContent = `✅ Movimiento completado: ${movedCount} elemento${movedCount > 1 ? 's' : ''}`;
    } else {
      this.statusEl.textContent = '❌ Sin cambios de posición';
    }
  }

  // ============================================
  // ⚡ FASE 5: ENHANCED SELECTION AND DELETE MANAGEMENT
  // ============================================
  _updateDeleteButton() {
    const btn = this.toolbarEl.querySelector('.de-btn-delete');
    if (!btn) return;
    
    if (this.selectedComponents.size > 0 && !this.isReadonly) {
      btn.style.display = 'inline-flex';
      if (this.selectedComponents.size === 1) {
        const compId = Array.from(this.selectedComponents)[0];
        const comp = this.components.find(c => c.id === compId);
        btn.textContent = comp ? `🗑️ Eliminar ${comp.label}` : '🗑️ Eliminar';
      } else {
        btn.textContent = `🗑️ Eliminar ${this.selectedComponents.size} elementos`;
      }
    } else {
      btn.style.display = 'none';
    }
  }

  /**
   * ⚡ FASE 5: Enhanced delete functionality for multiple selection
   */
  _deleteSelectedComponent() {
    if (this.isReadonly || this.selectedComponents.size === 0) {
      this.statusEl.textContent = '⚠️ No hay elementos seleccionados para eliminar';
      return;
    }

    const selectedIds = Array.from(this.selectedComponents);
    const componentsToDelete = this.components.filter(c => selectedIds.includes(c.id));
    
    if (componentsToDelete.length === 0) return;

    const confirmMessage = componentsToDelete.length === 1
      ? `¿Eliminar ${componentsToDelete[0].label}?`
      : `¿Eliminar ${componentsToDelete.length} elementos seleccionados?\n\n${componentsToDelete.map(c => `• ${c.label}`).join('\n')}`;

    if (confirm(confirmMessage)) {
      // Remove components and their wires
      this.components = this.components.filter(c => !selectedIds.includes(c.id));
      this.wires = this.wires.filter(w => 
        !selectedIds.includes(w.from) && !selectedIds.includes(w.to)
      );
      
      // Clear selection
      this.selectedComponents.clear();
      this._renderInspectorEmpty();
      this._updateDeleteButton();
      
      const statusText = componentsToDelete.length === 1
        ? `🗑️ ${componentsToDelete[0].label} eliminado`
        : `🗑️ ${componentsToDelete.length} elementos eliminados`;
      this.statusEl.textContent = statusText;
      
      // ⚡ Push to history after deleting
      this._pushHistory();
      
      this.render();
    }
  }

  /**
   * ⚡ FASE 5: Update inspector based on current selection
   */
  _updateInspectorForSelection() {
    if (this.selectedComponents.size === 0) {
      this._renderInspectorEmpty();
    } else if (this.selectedComponents.size === 1) {
      // Single selection - show full inspector
      const compId = Array.from(this.selectedComponents)[0];
      const comp = this.components.find(c => c.id === compId);
      this._renderInspector(comp);
    } else {
      // Multiple selection - show multi-selection inspector
      this._renderMultiSelectionInspector();
    }
  }

  /**
   * ⚡ FASE 5: Multi-selection inspector for batch operations
   */
  _renderMultiSelectionInspector() {
    const selectedIds = Array.from(this.selectedComponents);
    const selectedComps = this.components.filter(c => selectedIds.includes(c.id));
    
    if (selectedComps.length === 0) {
      this._renderInspectorEmpty();
      return;
    }

    // Analyze selection for common properties
    const types = new Set(selectedComps.map(c => c.type));
    const uniqueTypes = Array.from(types);
    
    let html = `
      <h3>⚡ Selección Múltiple</h3>
      <div class="de-insp-section">
        <div style="font-size:14px;color:#00ff41;font-weight:bold;">
          ${selectedComps.length} elementos seleccionados
        </div>
        <div style="font-size:11px;color:#888;margin-top:4px;">
          ${uniqueTypes.length === 1 
            ? `Todos: ${IEC_COMPONENTS[uniqueTypes[0]]?.name || uniqueTypes[0]}`
            : `Tipos mixtos: ${uniqueTypes.length} diferentes`}
        </div>
      </div>
      
      <div class="de-insp-section">
        <label>Elementos seleccionados:</label>
        <div style="max-height:120px;overflow-y:auto;border:1px solid #333;border-radius:4px;padding:6px;margin-top:4px;">
          ${selectedComps.map(comp => {
            const def = IEC_COMPONENTS[comp.type];
            return `<div style="display:flex;align-items:center;margin-bottom:3px;">
              <span style="color:${def?.color || '#888'};margin-right:6px;">●</span>
              <span style="font-weight:bold;">${comp.label}</span>
              <span style="font-size:9px;color:#666;margin-left:auto;">
                ${def?.name || comp.type} (${comp.col + 1},${comp.row + 1})
              </span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    // Common actions for multiple selection
    html += `
      <div class="de-insp-section">
        <label>⚡ Acciones en Lote</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
          <button class="de-btn" style="font-size:10px;padding:6px;" data-multi-action="copy">
            📋 Copiar Todo
          </button>
          <button class="de-btn" style="font-size:10px;padding:6px;background:#ff4444;color:#fff;" data-multi-action="delete">
            🗑️ Eliminar Todo
          </button>
        </div>`;

    // If all selected components are of the same type, show type-specific batch operations
    if (uniqueTypes.length === 1) {
      html += `
        <div style="margin-top:8px;font-size:10px;color:#888;text-align:center;">
          💡 Tip: Usa Ctrl+C para copiar, Ctrl+V para pegar
        </div>`;
    }

    html += `</div>`;

    if (!this.isReadonly) {
      html += `
        <div class="de-insp-section">
          <button class="de-btn" style="width:100%;background:var(--color-danger-bg);color:var(--color-danger);border-color:var(--color-danger);" data-multi-delete="true">
            🗑️ Eliminar ${selectedComps.length} elementos
          </button>
        </div>`;
    }

    this.inspectorEl.innerHTML = html;

    // Bind multi-selection action buttons
    this.inspectorEl.querySelectorAll('[data-multi-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.multiAction;
        switch (action) {
          case 'copy':
            this._copySelection();
            break;
          case 'delete':
            this._deleteSelectedComponent();
            break;
        }
      });
    });

    // Bind multi-delete button
    const multiDeleteBtn = this.inspectorEl.querySelector('[data-multi-delete]');
    if (multiDeleteBtn) {
      multiDeleteBtn.addEventListener('click', () => {
        this._deleteSelectedComponent();
      });
    }
  }

  // ============================================
  // ⚡ FASE 5: CLIPBOARD OPERATIONS
  // ============================================
  
  /**
   * Copy selected components to internal clipboard
   */
  _copySelection() {
    if (this.selectedComponents.size === 0) {
      this.statusEl.textContent = '⚠️ No hay elementos seleccionados para copiar';
      return;
    }

    const selectedIds = Array.from(this.selectedComponents);
    const selectedComps = this.components.filter(c => selectedIds.includes(c.id));
    
    // Deep copy components (excluding IDs which will be regenerated)
    this.clipboard = selectedComps.map(comp => ({
      ...JSON.parse(JSON.stringify(comp)),
      originalId: comp.id // Keep reference for relative positioning
    }));

    // Also copy related wires between selected components
    const selectedWires = this.wires.filter(wire => 
      selectedIds.includes(wire.from) && selectedIds.includes(wire.to)
    );
    
    this.clipboard.wires = selectedWires.map(wire => ({
      ...JSON.parse(JSON.stringify(wire))
    }));

    this.statusEl.textContent = `📋 Copiado: ${selectedComps.length} componentes, ${selectedWires.length} cables`;
  }

  /**
   * Paste components from clipboard
   */
  _pasteFromClipboard() {
    if (this.isReadonly) {
      this.statusEl.textContent = '⚠️ No se puede pegar en modo de solo lectura';
      return;
    }

    if (!this.clipboard || this.clipboard.length === 0) {
      this.statusEl.textContent = '⚠️ Clipboard vacío - usa Ctrl+C primero';
      return;
    }

    // Find a good paste position (try to avoid overlaps)
    let pasteOffsetCol = 2;
    let pasteOffsetRow = 1;
    
    // Calculate bounding box of clipboard items
    const minCol = Math.min(...this.clipboard.map(c => c.col));
    const minRow = Math.min(...this.clipboard.map(c => c.row));
    const maxCol = Math.max(...this.clipboard.map(c => c.col + (c.width || 1)));
    const maxRow = Math.max(...this.clipboard.map(c => c.row + (c.height || 1)));

    // Try to find free space
    let attempts = 0;
    while (attempts < 10) {
      const testCol = minCol + pasteOffsetCol;
      const testRow = minRow + pasteOffsetRow;
      
      // Check if the entire clipboard would fit without overlaps
      let hasOverlap = false;
      for (const clipComp of this.clipboard) {
        const newCol = clipComp.col - minCol + testCol;
        const newRow = clipComp.row - minRow + testRow;
        const width = clipComp.width || 1;
        const height = clipComp.height || 1;
        
        if (!this._isAreaFree(newCol, newRow, width, height)) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap) break;
      
      // Try next position
      pasteOffsetCol += 1;
      if (pasteOffsetCol > 6) {
        pasteOffsetCol = 0;
        pasteOffsetRow += 2;
      }
      attempts++;
    }

    // Create new components with new IDs
    const idMapping = {}; // oldId -> newId
    const newComponents = [];
    
    for (const clipComp of this.clipboard) {
      const newId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      idMapping[clipComp.originalId || clipComp.id] = newId;
      
      const newComp = {
        ...clipComp,
        id: newId,
        col: clipComp.col - minCol + minCol + pasteOffsetCol,
        row: clipComp.row - minRow + minRow + pasteOffsetRow,
        label: this._nextLabel(clipComp.type) // Generate new label
      };
      
      // Ensure within bounds
      if (newComp.col >= 0 && newComp.col < this.COLS && 
          newComp.row >= 0 && newComp.row < this.ROWS) {
        newComponents.push(newComp);
        this.components.push(newComp);
      }
    }

    // Paste related wires if clipboard has them
    const newWires = [];
    if (this.clipboard.wires) {
      for (const clipWire of this.clipboard.wires) {
        const newFromId = idMapping[clipWire.from];
        const newToId = idMapping[clipWire.to];
        
        if (newFromId && newToId) {
          const newWire = {
            ...clipWire,
            id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            from: newFromId,
            to: newToId,
            cableLabel: this._generateCableLabel()
          };
          
          newWires.push(newWire);
          this.wires.push(newWire);
        }
      }
    }

    // Select newly pasted components
    this.selectedComponents.clear();
    newComponents.forEach(comp => this.selectedComponents.add(comp.id));

    // Push to history and update UI
    this._pushHistory();
    this._updateInspectorForSelection();
    this._updateDeleteButton();
    this.render();

    this.statusEl.textContent = `📋 Pegado: ${newComponents.length} componentes, ${newWires.length} cables`;
  }

  /**
   * Duplicate selection (copy + paste in one operation)
   */
  _duplicateSelection() {
    if (this.selectedComponents.size === 0) {
      this.statusEl.textContent = '⚠️ No hay elementos seleccionados para duplicar';
      return;
    }

    this._copySelection();
    this._pasteFromClipboard();
  }

  /**
   * Select all components on current page
   */
  _selectAll() {
    if (this.components.length === 0) {
      this.statusEl.textContent = '⚠️ No hay componentes para seleccionar';
      return;
    }

    this.selectedComponents.clear();
    this.components.forEach(comp => this.selectedComponents.add(comp.id));
    
    this._updateInspectorForSelection();
    this._updateDeleteButton();
    this.render();

    this.statusEl.textContent = `⚡ Seleccionados todos: ${this.components.length} componentes`;
  }

  /**
   * Nudge (move) selected components by arrow keys
   * @param {string} direction - 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
   * @param {number} amount - Number of cells to move (1 for normal, 5 for Shift+Arrow)
   */
  _nudgeSelection(direction, amount = 1) {
    if (this.selectedComponents.size === 0) return;

    const selectedIds = Array.from(this.selectedComponents);
    const selectedComps = this.components.filter(c => selectedIds.includes(c.id));

    let deltaCol = 0;
    let deltaRow = 0;

    switch (direction) {
      case 'ArrowUp':
        deltaRow = -amount;
        break;
      case 'ArrowDown':
        deltaRow = amount;
        break;
      case 'ArrowLeft':
        deltaCol = -amount;
        break;
      case 'ArrowRight':
        deltaCol = amount;
        break;
    }

    // Check if all components can move without going out of bounds
    let canMove = true;
    for (const comp of selectedComps) {
      const newCol = comp.col + deltaCol;
      const newRow = comp.row + deltaRow;
      const width = comp.width || 1;
      const height = comp.height || 1;
      
      // Check bounds
      if (newCol < 0 || newRow < 0 || 
          newCol + width > this.COLS || 
          newRow + height > this.ROWS) {
        canMove = false;
        break;
      }
      
      // Check collisions with non-selected components
      if (!this._isAreaFree(newCol, newRow, width, height, comp.id)) {
        // Allow movement if collision is only with other selected components
        const collidingComp = this._getComponentAt(newCol, newRow);
        if (collidingComp && !selectedIds.includes(collidingComp.id)) {
          canMove = false;
          break;
        }
      }
    }

    if (!canMove) {
      this.statusEl.textContent = '⚠️ No se puede mover - fuera de límites o colisión';
      return;
    }

    // Move all selected components
    for (const comp of selectedComps) {
      comp.col += deltaCol;
      comp.row += deltaRow;
    }

    // Push to history and update UI
    this._pushHistory();
    this.render();

    const directionName = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    }[direction];

    this.statusEl.textContent = `⚡ Movido ${directionName} ${amount} celda${amount > 1 ? 's' : ''}: ${selectedComps.length} elementos`;
  }

  // ============================================
  // INSPECTOR
  // ============================================
  _renderInspectorEmpty() {
    this.inspectorEl.innerHTML = `
      <h3>Inspector</h3>
      <p class="de-inspector-empty">Selecciona un componente para inspeccionar sus propiedades.</p>
    `;
  }

  _renderInspector(comp) {
    if (!comp) { this._renderInspectorEmpty(); return; }
    const def = IEC_COMPONENTS[comp.type];
    if (!def) { this._renderInspectorEmpty(); return; }

    const p = comp.props || {};
    const connectionsFrom = this.wires.filter(w => w.from === comp.id);
    const connectionsTo = this.wires.filter(w => w.to === comp.id);

    // Build other components list for manual connection
    const others = this.components.filter(c => c.id !== comp.id);

    let wiresHtml = '';
    [...connectionsTo, ...connectionsFrom].forEach(w => {
      const otherId = w.from === comp.id ? w.to : w.from;
      const other = this.components.find(c => c.id === otherId);
      const dir = w.from === comp.id ? 'Hacia' : 'Desde';
      const sec = w.section || '1.5';
      const col = w.color || 'Negro';
      wiresHtml += `<div class="de-wire-item" style="flex-wrap:wrap;">
        <span>${dir}: <strong>${other ? other.label : '?'}</strong></span>
        <span style="font-size:0.65rem;color:var(--color-text-dim);">${sec}mm² ${col}</span>
        <button class="de-btn-xs de-wire-del" data-wire="${w.id}">✕</button>
      </div>`;
    });

    if (!wiresHtml) wiresHtml = '<p style="color:#808080;font-size:0.8rem;">Sin conexiones</p>';

    this.inspectorEl.innerHTML = `
      <h3>Inspector</h3>
      <div class="de-insp-section">
        <label>Etiqueta</label>
        <input type="text" class="de-insp-label" value="${comp.label}" />
      </div>
      <div class="de-insp-section">
        <label>Tipo</label>
        <div class="de-insp-type" style="color:${def.color}">${def.name}</div>
      </div>
      <div class="de-insp-section">
        <label>Posición</label>
        <div style="font-size:0.8rem;">Col: ${comp.col + 1} | Fila: ${comp.row + 1}</div>
        ${comp.width > 1 || comp.height > 1 ? `
        <div style="font-size:0.75rem;color:#888;margin-top:4px;">
          📦 Dimensiones: ${comp.width || 1} × ${comp.height || 1} celdas
        </div>
        ` : ''}
      </div>
      
      ${(comp.width > 1 || comp.height > 1) && !this.isReadonly ? `
      <div class="de-insp-section">
        <label>⚡ FASE 3: Dimensiones (Black Box)</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
          <div>
            <label style="font-size:8px;color:#666;">Ancho (celdas)</label>
            <input type="number" class="de-insp-width" value="${comp.width || 1}" min="1" max="${this.COLS}" 
                   style="width:100%;padding:4px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:2px;font-size:11px;" />
          </div>
          <div>
            <label style="font-size:8px;color:#666;">Alto (celdas)</label>
            <input type="number" class="de-insp-height" value="${comp.height || 1}" min="1" max="${this.ROWS}" 
                   style="width:100%;padding:4px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:2px;font-size:11px;" />
          </div>
        </div>
        <button class="de-btn" style="width:100%;background:#00ff41;color:#000;font-size:10px;" data-resize-component="${comp.id}">
          📦 Aplicar Dimensiones
        </button>
        <div style="font-size:8px;color:#666;text-align:center;margin-top:4px;">
          💡 Tip: Usar botones resize en el canvas o ajustar aquí
        </div>
      </div>
      ` : ''}
      <div class="de-insp-section">
        <label>Descripción</label>
        <input type="text" class="de-insp-prop" data-prop="description" value="${this._escHtml(p.description || '')}" placeholder="Ej: Contactor principal" />
      </div>
      <div class="de-insp-section">
        <label>Fabricante / N° Parte</label>
        <input type="text" class="de-insp-prop" data-prop="manufacturer" value="${this._escHtml(p.manufacturer || '')}" placeholder="Fabricante" style="margin-bottom:3px;" />
        <input type="text" class="de-insp-prop" data-prop="partNumber" value="${this._escHtml(p.partNumber || '')}" placeholder="N° parte" />
      </div>
      <div class="de-insp-section">
        <label>Características</label>
        <div style="display:flex;gap:3px;">
          <input type="text" class="de-insp-prop" data-prop="voltage" value="${this._escHtml(p.voltage || '')}" placeholder="V" style="width:33%;" />
          <input type="text" class="de-insp-prop" data-prop="current" value="${this._escHtml(p.current || '')}" placeholder="A" style="width:33%;" />
          <input type="text" class="de-insp-prop" data-prop="power" value="${this._escHtml(p.power || '')}" placeholder="W" style="width:34%;" />
        </div>
      </div>
      <div class="de-insp-section">
        <label>Conexiones</label>
        ${wiresHtml}
      </div>
      
      ${this.activeBusbars && this.activeBusbars.length > 0 ? `
      <div class="de-insp-section">
        <label>⚡ FASE 1: Conexión a Barras</label>
        ${this._renderBusbarConnectionsForComponent(comp)}
      </div>` : ''}
      
      ${this._renderTerminalConnectionSection(comp)}
      ${!this.isReadonly ? `
      <div class="de-insp-section">
        <button class="de-btn" style="width:100%;background:var(--color-danger-bg);color:var(--color-danger);border-color:var(--color-danger);" data-delete-comp="${comp.id}">🗑️ Eliminar componente</button>
      </div>` : ''}
    `;

    // Bind inspector events
    const labelInput = this.inspectorEl.querySelector('.de-insp-label');
    if (labelInput) {
      labelInput.addEventListener('change', () => {
        comp.label = labelInput.value.trim() || comp.label;
        this.render();
      });
    }

    // Bind prop inputs
    this.inspectorEl.querySelectorAll('.de-insp-prop').forEach(input => {
      input.addEventListener('change', () => {
        if (!comp.props) comp.props = {};
        comp.props[input.dataset.prop] = input.value;
      });
    });

    // Delete wire buttons
    this.inspectorEl.querySelectorAll('.de-wire-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const wireId = btn.dataset.wire;
        this.wires = this.wires.filter(w => w.id !== wireId);
        this._renderInspector(comp);
        this.render();
      });
    });

    // Manual connect with cable properties
    const connectBtn = this.inspectorEl.querySelector('.de-btn-connect');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        const targetId = this.inspectorEl.querySelector('.de-insp-connect-to').value;
        if (!targetId) return;
        const exists = this.wires.find(w =>
          (w.from === comp.id && w.to === targetId) ||
          (w.from === targetId && w.to === comp.id)
        );
        if (exists) {
          this.statusEl.textContent = '⚠️ Ya están conectados';
          return;
        }
        this.wires.push({
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          from: comp.id,
          fromTerminal: 'bottom',
          to: targetId,
          toTerminal: 'top',
          section: this.inspectorEl.querySelector('.de-insp-wire-section').value,
          color: this.inspectorEl.querySelector('.de-insp-wire-color').value,
          cableType: this.inspectorEl.querySelector('.de-insp-wire-type').value,
          length: this.inspectorEl.querySelector('.de-insp-wire-length').value || ''
        });
        this._renderInspector(comp);
        this.statusEl.textContent = `🔗 Conexión creada`;
        this.render();
      });
    }

    // Delete component button
    const deleteBtn = this.inspectorEl.querySelector('[data-delete-comp]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Eliminar ${comp.label}?`)) {
          this.components = this.components.filter(c => c.id !== comp.id);
          this.wires = this.wires.filter(w => w.from !== comp.id && w.to !== comp.id);
          this.selectedComponent = null;
          this._renderInspectorEmpty();
          this.statusEl.textContent = `🗑️ ${comp.label} eliminado`;
          this.render();
        }
      });
    }

    // ⚡ FASE 1: Busbar connection buttons
    this.inspectorEl.querySelectorAll('[data-connect-busbar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const busbarId = btn.dataset.connectBusbar;
        this._connectToBusbar(comp.id, busbarId);
        this._renderInspector(comp); // Refresh inspector
      });
    });

    this.inspectorEl.querySelectorAll('[data-disconnect-busbar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const busbarId = btn.dataset.disconnectBusbar;
        this._disconnectFromBusbar(comp.id, busbarId);
        this._renderInspector(comp); // Refresh inspector
      });
    });

    // ⚡ FASE 2: Terminal-specific connection handlers
    const connectToSelect = this.inspectorEl.querySelector('.de-insp-connect-to');
    const toTerminalSelect = this.inspectorEl.querySelector('.de-insp-to-terminal');
    const connectTerminalBtn = this.inspectorEl.querySelector('.de-btn-connect-terminal');

    // Populate destination terminals when component is selected
    if (connectToSelect && toTerminalSelect) {
      connectToSelect.addEventListener('change', () => {
        const targetId = connectToSelect.value;
        
        if (!targetId) {
          toTerminalSelect.innerHTML = '<option>-- Primero selecciona componente --</option>';
          toTerminalSelect.disabled = true;
          return;
        }

        const targetComp = this.components.find(c => c.id === targetId);
        if (!targetComp) {
          toTerminalSelect.innerHTML = '<option>-- Componente no encontrado --</option>';
          toTerminalSelect.disabled = true;
          return;
        }

        const targetTerminals = this._getComponentTerminals(targetComp);
        
        if (targetTerminals.length === 0) {
          toTerminalSelect.innerHTML = '<option value="top">TOP (arriba)</option><option value="bottom">BOTTOM (abajo)</option>';
        } else {
          toTerminalSelect.innerHTML = targetTerminals.map(t => 
            `<option value="${t.id}" style="color:${this._getTerminalColor(t.type)}">${t.label} (${t.side})</option>`
          ).join('');
        }
        
        toTerminalSelect.disabled = false;
      });
    }

    // Terminal-specific connection button
    if (connectTerminalBtn) {
      connectTerminalBtn.addEventListener('click', () => {
        const fromTerminal = this.inspectorEl.querySelector('.de-insp-from-terminal')?.value;
        const targetId = this.inspectorEl.querySelector('.de-insp-connect-to')?.value;
        const toTerminal = this.inspectorEl.querySelector('.de-insp-to-terminal')?.value;

        if (!fromTerminal || !targetId || !toTerminal) {
          this.statusEl.textContent = '⚠️ Debes seleccionar todos los terminales';
          return;
        }

        // Check if connection already exists
        const exists = this.wires.find(w =>
          (w.from === comp.id && w.to === targetId) ||
          (w.from === targetId && w.to === comp.id)
        );
        if (exists) {
          this.statusEl.textContent = '⚠️ Ya existe una conexión entre estos componentes';
          return;
        }

        // ⚡ FASE 4: Create new wire with automatic cable labeling
        const newWire = {
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          from: comp.id,
          fromTerminal: fromTerminal,
          to: targetId,
          toTerminal: toTerminal,
          section: this.inspectorEl.querySelector('.de-insp-wire-section')?.value || '1.5',
          color: this.inspectorEl.querySelector('.de-insp-wire-color')?.value || 'Negro',
          cableType: this.inspectorEl.querySelector('.de-insp-wire-type')?.value || 'H07V-K',
          length: this.inspectorEl.querySelector('.de-insp-wire-length')?.value || '',
          cableLabel: this._generateCableLabel() // ⚡ FASE 4: Auto-generate cable label
        };

        this.wires.push(newWire);
        
        // Push to history
        this._pushHistory();
        
        // Update UI
        this._renderInspector(comp);
        this.render();

        // Update status
        const targetComp = this.components.find(c => c.id === targetId);
        this.statusEl.textContent = `⚡ Conectado: ${comp.label}[${fromTerminal}] → ${targetComp?.label || '?'}[${toTerminal}]`;
      });
    }
  }

  // ============================================
  // CANVAS RENDERING
  // ============================================
  _handleResize() {
    const wrap = this.canvas.parentElement;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    this.CELL_W = Math.max(60, Math.floor(wrapRect.width / this.COLS));
    this.canvasW = this.CELL_W * this.COLS;
    this.canvasH = this.CELL_H * this.ROWS;
    this.canvas.width = this.canvasW;
    this.canvas.height = this.canvasH;
    this.canvas.style.width = this.canvasW + 'px';
    this.canvas.style.height = this.canvasH + 'px';
    this.render();
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = this.canvasW;
    const H = this.canvasH;

    // Refresh theme colors each render
    this._refreshColors();

    // Clear
    ctx.fillStyle = this._colors.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw grid
    this._drawGrid(ctx, W, H);

    // ⚡ FASE 1: Draw horizontal busbars
    this._drawBusbars(ctx);

    // Draw wires
    this._drawWires(ctx);

    // ⚡ FASE 1: Draw busbar connections
    this._drawBusbarConnections(ctx);

    // Draw components
    this.components.forEach(comp => {
      this._drawComponent(ctx, comp);
    });

    // Hover highlight
    if (this.hoverCell && this.placingType) {
      const { col, row } = this.hoverCell;
      const occupied = this._getComponentAt(col, row);
      ctx.fillStyle = occupied ? 'rgba(255,0,0,0.15)' : 'rgba(0,255,65,0.1)';
      ctx.fillRect(col * this.CELL_W, row * this.CELL_H, this.CELL_W, this.CELL_H);
      // Preview ghost
      if (!occupied) {
        ctx.globalAlpha = 0.4;
        const def = IEC_COMPONENTS[this.placingType];
        if (def && def.draw) {
          def.draw(ctx, col * this.CELL_W, row * this.CELL_H, this.CELL_W, this.CELL_H, '?');
        }
        ctx.globalAlpha = 1.0;
      }
    }

    // ⚡ FASE 5: Enhanced multi-selection highlighting
    if (this.selectedComponents.size > 0) {
      const selectedIds = Array.from(this.selectedComponents);
      selectedIds.forEach((compId, index) => {
        const comp = this.components.find(c => c.id === compId);
        if (!comp) return;
        
        // Calculate actual component dimensions for multi-cell components
        const compWidth = (comp.width || 1) * this.CELL_W;
        const compHeight = (comp.height || 1) * this.CELL_H;
        
        // Selection highlight with different colors for multiple selection
        ctx.strokeStyle = selectedIds.length === 1 ? '#00ff41' : '#ffaa00'; // Green for single, Orange for multi
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(
          comp.col * this.CELL_W + 2,
          comp.row * this.CELL_H + 2,
          compWidth - 4,
          compHeight - 4
        );
        
        // Add selection indicator number for multiple selection
        if (selectedIds.length > 1) {
          ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(
            comp.col * this.CELL_W + 16,
            comp.row * this.CELL_H + 16,
            10, 0, Math.PI * 2
          );
          ctx.fill();
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px Courier New';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            String(index + 1),
            comp.col * this.CELL_W + 16,
            comp.row * this.CELL_H + 16
          );
          
          // Reset text alignment
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
        
        ctx.setLineDash([]);
      });
    }

    // Update cursor
    this.canvas.style.cursor = this.placingType ? 'crosshair' : (this.dragging ? 'grabbing' : 'default');
  }

  _drawGrid(ctx, W, H) {
    ctx.strokeStyle = this._colors.grid;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let c = 0; c <= this.COLS; c++) {
      const x = c * this.CELL_W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Horizontal lines
    for (let r = 0; r <= this.ROWS; r++) {
      const y = r * this.CELL_H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Column headers
    ctx.fillStyle = this._colors.border;
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    for (let c = 0; c < this.COLS; c++) {
      ctx.fillText(`${c + 1}`, c * this.CELL_W + this.CELL_W / 2, 14);
    }

    // Row numbers
    ctx.textAlign = 'left';
    for (let r = 0; r < this.ROWS; r++) {
      ctx.fillText(`${r + 1}`, 4, r * this.CELL_H + 14);
    }
  }

  _drawComponent(ctx, comp) {
    const def = IEC_COMPONENTS[comp.type];
    if (!def || !def.draw) return;
    const x = comp.col * this.CELL_W;
    const y = comp.row * this.CELL_H;
    
    // ⚡ FASE 3: Calculate actual dimensions for multi-cell components
    const width = (comp.width || 1) * this.CELL_W;
    const height = (comp.height || 1) * this.CELL_H;
    
    // Store theme text color for label rendering
    ctx._labelColor = this._colors.text;
    
    // Pass component object for Black Box components that need it
    if (def.draw.length > 5) {
      def.draw(ctx, x, y, this.CELL_W, this.CELL_H, comp.label, comp);
    } else {
      def.draw(ctx, x, y, width, height, comp.label);
    }
    
    // ⚡ FASE 2: Draw multi-terminals if schema exists
    this._drawTerminals(ctx, comp);
    
    // ⚡ FASE 6: Draw cross-references for multi-page components
    if (this.showCrossReferences) {
      this._drawComponentCrossReferences(ctx, comp);
    }
    
    // ⚡ FASE 3: Draw resize handles for selected Black Box components
    if (this.selectedComponent === comp.id && (comp.width > 1 || comp.height > 1)) {
      this._drawResizeHandles(ctx, comp);
    }
  }

  /**
   * ⚡ FASE 6: Draw cross-references for a specific component
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} comp - Component object
   */
  _drawComponentCrossReferences(ctx, comp) {
    // Calculate cross-references dynamically
    const crossRefs = calculateCrossReferences(this.pages);
    
    // Use the global drawCrossReferences function
    drawCrossReferences(ctx, comp, crossRefs, this.currentPageIndex);
  }

  /**
   * ⚡ FASE 6: Update cross-references cache when pages change
   */
  _updateCrossReferences() {
    const crossRefs = calculateCrossReferences(this.pages);
    this.crossReferences.clear();
    
    // Cache the cross-references for efficient access
    Object.entries(crossRefs).forEach(([label, locations]) => {
      this.crossReferences.set(label, locations);
    });
    
    // Log debug info
    if (crossRefs && Object.keys(crossRefs).length > 0) {
      console.log('[DiagramEditor] Updated cross-references:', Object.keys(crossRefs).length, 'components with multi-page references');
    }
  }

  /**
   * ⚡ FASE 6: Get IEC nomenclature breakdown for a component (for Inspector)
   * @param {Object} comp - Component object
   * @returns {Object} - Nomenclature breakdown
   */
  _getComponentNomenclatureBreakdown(comp) {
    if (!comp) return null;
    
    const currentPage = this.pages[this.currentPageIndex];
    const pageType = currentPage.type;
    const machineCode = this.diagram.machineCode || 'CRGM';
    
    return getIECNomenclatureBreakdown(comp.label, pageType, machineCode);
  }

  /**
   * ⚡ FASE 3: Draw resize handles for Black Box components
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} comp - Component object
   */
  _drawResizeHandles(ctx, comp) {
    const x = comp.col * this.CELL_W;
    const y = comp.row * this.CELL_H;
    const w = (comp.width || 1) * this.CELL_W;
    const h = (comp.height || 1) * this.CELL_H;
    
    const handleSize = 8;
    const handles = [
      { x: x + w - handleSize/2, y: y + h - handleSize/2, cursor: 'se-resize', type: 'br' }, // Bottom-right
      { x: x + w - handleSize/2, y: y + h/2 - handleSize/2, cursor: 'e-resize', type: 'r' },  // Right
      { x: x + w/2 - handleSize/2, y: y + h - handleSize/2, cursor: 's-resize', type: 'b' }   // Bottom
    ];
    
    handles.forEach(handle => {
      // Handle background
      ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      
      // Handle border
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 1;
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      
      // Handle grip lines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let i = 1; i < handleSize; i += 2) {
        ctx.beginPath();
        ctx.moveTo(handle.x + 2, handle.y + i);
        ctx.lineTo(handle.x + handleSize - 2, handle.y + i);
        ctx.stroke();
      }
    });
  }
  
  /**
   * ⚡ FASE 2: Draw terminal points and labels for multi-terminal components
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} comp - Component object
   */
  _drawTerminals(ctx, comp) {
    const schema = COMPONENT_TERMINAL_SCHEMA[comp.type];
    if (!schema || !schema.terminals) return;
    
    // Only draw terminals if component is selected or we're in debug mode
    const shouldShowTerminals = this.selectedComponent === comp.id || window.DEBUG_TERMINALS;
    
    if (!shouldShowTerminals) return;
    
    Object.entries(schema.terminals).forEach(([terminalId, terminal]) => {
      const position = this._getTerminalPosition(comp, terminalId);
      if (!position) return;
      
      const { x, y } = position;
      
      // Determine terminal color based on type
      let terminalColor = '#00ff41'; // Default green
      switch (terminal.type) {
        case 'power':
          terminalColor = '#ff3300'; // Red for power
          break;
        case 'control':
          terminalColor = '#ffaa00'; // Orange for control
          break;
        case 'ground':
          terminalColor = '#00aa00'; // Green for ground
          break;
        case 'input':
          terminalColor = '#0088ff'; // Blue for inputs
          break;
        case 'output':
          terminalColor = '#ff6600'; // Orange for outputs
          break;
        case 'coil':
          terminalColor = '#aa66ff'; // Purple for coils
          break;
        case 'contact_no':
        case 'contact_nc':
          terminalColor = '#66ddff'; // Light blue for contacts
          break;
        case 'aux':
          terminalColor = '#ffdd00'; // Yellow for auxiliary
          break;
        case 'terminal':
          terminalColor = '#ff66aa'; // Pink for terminals
          break;
      }
      
      // Draw terminal connection point
      ctx.fillStyle = terminalColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw terminal border/outline
      ctx.strokeStyle = terminalColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw terminal label
      ctx.fillStyle = this._colors.text;
      ctx.font = '8px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position label based on terminal side to avoid overlap
      let labelX = x;
      let labelY = y;
      
      switch (terminal.side) {
        case 'top':
          labelY = y - 8;
          break;
        case 'bottom':
          labelY = y + 8;
          break;
        case 'left':
          labelX = x - 10;
          ctx.textAlign = 'right';
          break;
        case 'right':
          labelX = x + 10;
          ctx.textAlign = 'left';
          break;
      }
      
      // Draw label background for better visibility
      const labelWidth = ctx.measureText(terminal.label).width;
      const labelPadding = 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        labelX - labelWidth/2 - labelPadding,
        labelY - 4 - labelPadding,
        labelWidth + labelPadding * 2,
        8 + labelPadding * 2
      );
      
      // Draw label text
      ctx.fillStyle = terminalColor;
      ctx.fillText(terminal.label, labelX, labelY);
    });
    
    // Reset text alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  /**
   * ⚡ FASE 4: Advanced wire drawing with orthogonal routing and professional labels
   */
  _drawWires(ctx) {
    this.wires.forEach(wire => {
      const fromComp = this.components.find(c => c.id === wire.from);
      const toComp = this.components.find(c => c.id === wire.to);
      if (!fromComp || !toComp) return;

      // ⚡ FASE 2: Get specific terminal positions if available
      let fromPos = this._getTerminalPosition(fromComp, wire.fromTerminal || 'bottom');
      let toPos = this._getTerminalPosition(toComp, wire.toTerminal || 'top');

      // Fallback to legacy positions if no specific terminals found
      if (!fromPos) {
        fromPos = {
          x: fromComp.col * this.CELL_W + this.CELL_W / 2,
          y: fromComp.row * this.CELL_H + this.CELL_H - 8
        };
      }
      if (!toPos) {
        toPos = {
          x: toComp.col * this.CELL_W + this.CELL_W / 2,
          y: toComp.row * this.CELL_H + 8
        };
      }

      // ⚡ FASE 4: Calculate orthogonal route
      const route = this._calculateWireRoute(fromPos, toPos, fromPos.terminal, toPos.terminal);

      // ⚡ FASE 4: Determine wire color based on IEC color or section
      let wireColor = this._colors.success; // Default green
      
      // Use IEC wire color if specified
      if (wire.color) {
        const iecColor = this._getWireColorByName(wire.color);
        wireColor = iecColor.hex;
      } else {
        // Fallback: color by section thickness
        const section = parseFloat(wire.section || '1.5');
        if (section >= 4) {
          wireColor = '#ff6600'; // Thick cables = orange
        } else if (section >= 2.5) {
          wireColor = '#ffaa00'; // Medium cables = yellow
        }
      }

      // ⚡ FASE 4: Set line width based on cable section
      const section = parseFloat(wire.section || '1.5');
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = Math.max(1.5, Math.min(5, section * 0.8)); // Scale line width with section

      // ⚡ FASE 4: Draw wire using calculated route
      this._drawWireRoute(ctx, route, wire, wireColor);

      // ⚡ FASE 4: Draw advanced cable labels with section and color info
      if (wire.cableLabel || (this.selectedComponent === fromComp.id || this.selectedComponent === toComp.id)) {
        this._drawCableLabel(ctx, route, wire, wireColor);
      }
    });
  }

  // ============================================
  // ⚡ FASE 1: HORIZONTAL BUSBARS RENDERING
  // ============================================
  
  /**
   * Draw horizontal power/control busbars at the top of the diagram
   * @param {CanvasRenderingContext2D} ctx 
   */
  _drawBusbars(ctx) {
    if (!this.activeBusbars || this.activeBusbars.length === 0) return;

    const busbarY = 30; // Position from top (above row 1)
    const busbarSpacing = 16; // Vertical spacing between busbars
    
    this.activeBusbars.forEach((busbarId, index) => {
      const busbarDef = BUSBAR_TYPES[busbarId];
      if (!busbarDef) return;

      const y = busbarY + (index * busbarSpacing);
      
      // Draw horizontal line across entire width
      ctx.strokeStyle = busbarDef.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasW, y);
      ctx.stroke();

      // Draw connection points every 2 columns (standard IEC practice)
      for (let col = 0; col < this.COLS; col += 1) {
        const x = col * this.CELL_W + this.CELL_W / 2;
        
        // Connection point circle
        ctx.fillStyle = busbarDef.color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw labels every 3 columns
      ctx.fillStyle = busbarDef.color;
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'center';
      for (let col = 1; col < this.COLS; col += 3) {
        const x = col * this.CELL_W + this.CELL_W / 2;
        ctx.fillText(busbarDef.name, x, y - 6);
      }

      // Voltage/section info (small text)
      ctx.fillStyle = busbarDef.color;
      ctx.font = '8px Courier New';
      ctx.textAlign = 'left';
      const infoText = `${busbarDef.voltage} ${busbarDef.section}`;
      ctx.fillText(infoText, 8, y - 6);
    });
  }

  /**
   * Draw vertical connections from busbars to components
   * @param {CanvasRenderingContext2D} ctx 
   */
  _drawBusbarConnections(ctx) {
    if (!this.busbarConnections || this.busbarConnections.length === 0) return;

    const busbarY = 30;
    const busbarSpacing = 16;

    this.busbarConnections.forEach(conn => {
      const component = this.components.find(c => c.id === conn.componentId);
      const busbarIndex = this.activeBusbars.indexOf(conn.busbarId);
      
      if (!component || busbarIndex === -1) return;

      const busbarDef = BUSBAR_TYPES[conn.busbarId];
      if (!busbarDef) return;

      // Calculate positions
      const busbarYPos = busbarY + (busbarIndex * busbarSpacing);
      const compX = component.col * this.CELL_W + this.CELL_W / 2;
      const compY = component.row * this.CELL_H + 8; // Top terminal of component
      
      // Draw vertical connection line
      ctx.strokeStyle = busbarDef.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compX, busbarYPos);
      ctx.lineTo(compX, compY);
      ctx.stroke();

      // Connection dots
      ctx.fillStyle = busbarDef.color;
      ctx.beginPath();
      ctx.arc(compX, busbarYPos, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(compX, compY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Optional: Cable label
      if (conn.cableLabel) {
        ctx.fillStyle = this._colors.text;
        ctx.font = '8px Courier New';
        ctx.textAlign = 'center';
        const midY = (busbarYPos + compY) / 2;
        ctx.fillText(conn.cableLabel, compX + 8, midY);
      }
    });
  }

  // ============================================
  // PAGE MANAGEMENT
  // ============================================
  _renderPageBar() {
    if (!this.pageBarEl) return;
    let html = '';
    this.pages.forEach((page, i) => {
      const pt = PAGE_TYPES[page.type] || PAGE_TYPES.general;
      const active = i === this.currentPageIndex ? 'active' : '';
      html += `<div class="de-page-tab ${active}" data-index="${i}" style="border-bottom-color:${pt.color}">
        <span class="de-page-tab-icon">${pt.icon}</span>
        <span class="de-page-tab-name">${page.name}</span>
        ${this.pages.length > 1 ? `<button class="de-page-del" data-index="${i}" title="Eliminar hoja">✕</button>` : ''}
      </div>`;
    });
    html += `<button class="de-page-add" title="Agregar hoja">+ Hoja</button>`;
    this.pageBarEl.innerHTML = html;
  }

  switchPage(index) {
    if (index < 0 || index >= this.pages.length) return;
    this._saveCurrentPage();
    this.currentPageIndex = index;
    this._syncCurrentPage();
    this.selectedComponent = null;
    this.placingType = null;
    this._renderPageBar();
    this._renderInspectorEmpty();
    this._handleResize();
    const page = this.pages[index];
    const pt = PAGE_TYPES[page.type] || PAGE_TYPES.general;
    this.statusEl.textContent = `📄 ${page.name} (${pt.name}) — ${this.components.length} componentes`;
  }

  addPage() {
    // Show dialog to pick type
    const typeKeys = Object.keys(PAGE_TYPES);
    const options = typeKeys.map(k => `${PAGE_TYPES[k].icon} ${PAGE_TYPES[k].name}`);
    const choice = prompt(
      'Tipo de hoja:\n' + typeKeys.map((k, i) => `${i + 1}. ${PAGE_TYPES[k].icon} ${PAGE_TYPES[k].name}`).join('\n') +
      '\n\nIngresa el número:',
      '10'
    );
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    const typeKey = typeKeys[idx] || 'general';
    const pt = PAGE_TYPES[typeKey];

    const name = prompt('Nombre de la hoja:', `${pt.name} ${this.pages.length + 1}`) || `Hoja ${this.pages.length + 1}`;
    
    this._saveCurrentPage();
    const newPage = {
      id: `page_${Date.now()}`,
      name: name,
      type: typeKey,
      elements: [],
      wires: [],
      counters: {},
      rows: 12
    };
    this.pages.push(newPage);
    this.switchPage(this.pages.length - 1);
    this.statusEl.textContent = `✅ Hoja "${name}" creada (${pt.name})`;
  }

  deletePage(index) {
    if (this.pages.length <= 1) {
      this.statusEl.textContent = '⚠️ No puedes eliminar la última hoja';
      return;
    }
    const page = this.pages[index];
    if (!confirm(`¿Eliminar hoja "${page.name}"? Se perderán todos sus componentes.`)) return;
    
    this.pages.splice(index, 1);
    if (this.currentPageIndex >= this.pages.length) {
      this.currentPageIndex = this.pages.length - 1;
    }
    this._syncCurrentPage();
    this._renderPageBar();
    this._handleResize();
    this.statusEl.textContent = `🗑️ Hoja "${page.name}" eliminada`;
  }

  // ============================================
  // WORK MODE
  // ============================================
  _setWorkMode(mode) {
    if (!WORK_MODES[mode]) return;
    const prev = this.workMode;
    
    if (mode === 'finalizado' && prev !== 'finalizado') {
      if (!confirm('¿Marcar como FINALIZADO? No podrás editar hasta cambiar el modo.')) {
        // Reset select
        this.modeIndicatorEl.querySelector('.de-mode-select').value = prev;
        return;
      }
    }
    
    this.workMode = mode;
    this.diagram.workMode = mode;
    const info = WORK_MODES[mode];
    this.modeIndicatorEl.querySelector('.de-mode-indicator').innerHTML = 
      `<span style="color:${info.color}">${info.icon} ${info.name}</span>`;
    this.modeIndicatorEl.querySelector('.de-mode-indicator').style.color = info.color;
    
    // Disable palette in readonly modes
    const sidebar = this.container.querySelector('.de-sidebar');
    if (sidebar) {
      sidebar.style.opacity = this.isReadonly ? '0.5' : '1';
      sidebar.style.pointerEvents = this.isReadonly ? 'none' : 'auto';
    }
    
    if (this.isReadonly) {
      this.placingType = null;
      this.selectedComponent = null;
    }
    
    this.statusEl.textContent = `${info.icon} Modo cambiado a: ${info.name}`;
    this.render();
  }

  // ============================================
  // ⚡ FASE 1: BUSBAR CONNECTION HELPER FOR INSPECTOR
  // ============================================
  
  /**
   * Render busbar connections UI for a specific component in the Inspector
   * @param {Object} comp - Component object
   * @returns {string} HTML for busbar connections section
   */
  _renderBusbarConnectionsForComponent(comp) {
    if (!this.activeBusbars || this.activeBusbars.length === 0) {
      return '<p style="color:#666;font-size:0.8rem;">No hay barras activas en esta página.</p>';
    }

    let html = '<div style="margin-bottom:8px;">';
    
    this.activeBusbars.forEach(busbarId => {
      const busbar = BUSBAR_TYPES[busbarId];
      if (!busbar) return;

      // Check if component is connected to this busbar
      const connection = this.busbarConnections.find(conn => 
        conn.componentId === comp.id && conn.busbarId === busbarId
      );

      const isConnected = !!connection;
      const bgColor = isConnected ? '#003322' : '#1a1a1a';
      const borderColor = isConnected ? busbar.color : '#333';

      html += `
        <div class="busbar-connection-item" style="display:flex;align-items:center;margin-bottom:6px;padding:6px;background:${bgColor};border:1px solid ${borderColor};border-radius:4px;">
          <div style="flex:1;">
            <div style="color:${busbar.color};font-weight:bold;font-size:11px;">${busbar.name}</div>
            <div style="font-size:9px;color:#888;">${busbar.description} — ${busbar.voltage}</div>
          </div>
          <div style="display:flex;gap:4px;align-items:center;">
            ${isConnected ? 
              `<span style="color:#00ff41;font-size:9px;">✓ Conectado</span>
               <button class="de-btn-xs" style="background:#ff4444;color:#fff;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;" 
                       data-disconnect-busbar="${busbarId}">✕</button>` :
              `<button class="de-btn-xs" style="background:${busbar.color};color:#000;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;" 
                       data-connect-busbar="${busbarId}">Conectar</button>`
            }
          </div>
        </div>`;
    });

    html += '</div>';
    return html;
  }

  /**
   * Connect a component to a busbar
   * @param {string} componentId - Component ID
   * @param {string} busbarId - Busbar ID
   * @param {string} terminal - Terminal name (optional)
   */
  _connectToBusbar(componentId, busbarId, terminal = 'L1') {
    // Check if already connected
    const existingConnection = this.busbarConnections.find(conn => 
      conn.componentId === componentId && conn.busbarId === busbarId
    );
    
    if (existingConnection) {
      this.statusEl.textContent = '⚠️ Ya está conectado a esta barra';
      return;
    }

    // Create new connection
    const connection = {
      id: `bc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      componentId: componentId,
      busbarId: busbarId,
      terminal: terminal,
      cableLabel: null // Can be set later
    };

    this.busbarConnections.push(connection);
    this._saveCurrentPage();

    // Re-render
    this.render();

    // Update status
    const busbar = BUSBAR_TYPES[busbarId];
    const comp = this.components.find(c => c.id === componentId);
    this.statusEl.textContent = `⚡ ${comp?.label || 'Componente'} conectado a ${busbar?.name || busbarId}`;
  }

  /**
   * Disconnect a component from a busbar
   * @param {string} componentId - Component ID
   * @param {string} busbarId - Busbar ID
   */
  _disconnectFromBusbar(componentId, busbarId) {
    // Remove connection
    this.busbarConnections = this.busbarConnections.filter(conn => 
      !(conn.componentId === componentId && conn.busbarId === busbarId)
    );
    
    this._saveCurrentPage();
    this.render();

    // Update status
    const busbar = BUSBAR_TYPES[busbarId];
    const comp = this.components.find(c => c.id === componentId);
    this.statusEl.textContent = `⚡ ${comp?.label || 'Componente'} desconectado de ${busbar?.name || busbarId}`;
  }

  // ============================================
  // ⚡ FASE 2: TERMINAL CONNECTION UI FOR INSPECTOR
  // ============================================
  
  /**
   * Render terminal-specific connection section for the Inspector
   * @param {Object} comp - Component object
   * @returns {string} HTML for terminal connection section
   */
  _renderTerminalConnectionSection(comp) {
    const terminals = this._getComponentTerminals(comp);
    const others = this.components.filter(c => c.id !== comp.id);
    
    if (terminals.length === 0 || others.length === 0) {
      // Fallback to simple connection
      return `
        <div class="de-insp-section">
          <label>Conectar a:</label>
          <select class="de-insp-connect-to">
            <option value="">-- Seleccionar --</option>
            ${others.map(o => `<option value="${o.id}">${o.label} (${IEC_COMPONENTS[o.type] ? IEC_COMPONENTS[o.type].name : o.type})</option>`).join('')}
          </select>
          <div style="display:flex;gap:3px;margin-top:3px;">
            <select class="de-insp-wire-section" style="width:40%;">
              <option value="0.5">0.5mm²</option>
              <option value="0.75">0.75mm²</option>
              <option value="1">1mm²</option>
              <option value="1.5" selected>1.5mm²</option>
              <option value="2.5">2.5mm²</option>
              <option value="4">4mm²</option>
              <option value="6">6mm²</option>
              <option value="10">10mm²</option>
            </select>
            <select class="de-insp-wire-color" style="width:60%;">
              <option>Negro</option><option>Marrón</option><option>Rojo</option>
              <option>Naranja</option><option>Amarillo</option><option>Verde</option>
              <option>Azul</option><option>Violeta</option><option>Gris</option>
              <option>Blanco</option><option>Amarillo/Verde</option>
            </select>
          </div>
          <div style="display:flex;gap:3px;margin-top:3px;">
            <select class="de-insp-wire-type" style="width:50%;">
              <option>H07V-K</option><option>H07V-U</option><option>H07V-R</option>
              <option>NYA</option><option>RV-K</option>
            </select>
            <input type="text" class="de-insp-wire-length" placeholder="Long. (m)" style="width:50%;" />
          </div>
          <button class="de-btn de-btn-connect" style="margin-top:4px;width:100%">🔗 Conectar</button>
        </div>
      `;
    }

    // ⚡ FASE 2: Advanced terminal-specific connection UI
    return `
      <div class="de-insp-section">
        <label>⚡ FASE 2: Conexión Específica por Terminal</label>
        
        <!-- FROM Terminal Selection -->
        <div style="margin-bottom:8px;">
          <label style="font-size:9px;color:#888;">Terminal de Origen (${comp.label}):</label>
          <select class="de-insp-from-terminal" style="width:100%;margin-top:2px;">
            ${terminals.map(t => `<option value="${t.id}" style="color:${this._getTerminalColor(t.type)}">${t.label} (${t.side})</option>`).join('')}
          </select>
        </div>
        
        <!-- TO Component Selection -->
        <div style="margin-bottom:8px;">
          <label style="font-size:9px;color:#888;">Componente Destino:</label>
          <select class="de-insp-connect-to" style="width:100%;margin-top:2px;">
            <option value="">-- Seleccionar --</option>
            ${others.map(o => `<option value="${o.id}">${o.label} (${IEC_COMPONENTS[o.type] ? IEC_COMPONENTS[o.type].name : o.type})</option>`).join('')}
          </select>
        </div>
        
        <!-- TO Terminal Selection (populated dynamically) -->
        <div style="margin-bottom:8px;">
          <label style="font-size:9px;color:#888;">Terminal de Destino:</label>
          <select class="de-insp-to-terminal" style="width:100%;margin-top:2px;" disabled>
            <option>-- Primero selecciona componente --</option>
          </select>
        </div>
        
        <!-- Cable Properties -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:6px;">
          <div>
            <label style="font-size:8px;color:#666;">Sección</label>
            <select class="de-insp-wire-section" style="width:100%;">
              <option value="0.5">0.5mm²</option>
              <option value="0.75">0.75mm²</option>
              <option value="1">1mm²</option>
              <option value="1.5" selected>1.5mm²</option>
              <option value="2.5">2.5mm²</option>
              <option value="4">4mm²</option>
              <option value="6">6mm²</option>
              <option value="10">10mm²</option>
            </select>
          </div>
          <div>
            <label style="font-size:8px;color:#666;">Color</label>
            <select class="de-insp-wire-color" style="width:100%;">
              <option>Negro</option><option>Marrón</option><option>Rojo</option>
              <option>Naranja</option><option>Amarillo</option><option>Verde</option>
              <option>Azul</option><option>Violeta</option><option>Gris</option>
              <option>Blanco</option><option>Amarillo/Verde</option>
            </select>
          </div>
        </div>
        
        <div style="display:flex;gap:3px;margin-bottom:8px;">
          <select class="de-insp-wire-type" style="width:60%;">
            <option>H07V-K</option><option>H07V-U</option><option>H07V-R</option>
            <option>NYA</option><option>RV-K</option>
          </select>
          <input type="text" class="de-insp-wire-length" placeholder="Long. (m)" style="width:40%;" />
        </div>
        
        <button class="de-btn de-btn-connect-terminal" style="width:100%;background:#00ff41;color:#000;font-weight:bold;">
          ⚡ Conectar Terminal Específico
        </button>
        
        <div style="margin-top:6px;font-size:8px;color:#666;text-align:center;">
          💡 Tip: Selecciona terminales específicos para conexiones precisas
        </div>
      </div>
    `;
  }

  /**
   * Get color for terminal type
   * @param {string} type - Terminal type
   * @returns {string} Color code
   */
  _getTerminalColor(type) {
    switch (type) {
      case 'power': return '#ff3300';
      case 'control': return '#ffaa00';
      case 'ground': return '#00aa00';
      case 'input': return '#0088ff';
      case 'output': return '#ff6600';
      case 'coil': return '#aa66ff';
      case 'contact_no':
      case 'contact_nc': return '#66ddff';
      case 'aux': return '#ffdd00';
      case 'terminal': return '#ff66aa';
      default: return '#00ff41';
    }
  }

  // ============================================
  // ⚡ FASE 1: CONFIGURAR BARRAS HORIZONTALES
  // ============================================
  configureBusbars() {
    if (this.isReadonly) {
      this.statusEl.textContent = '⚠️ No se pueden modificar barras en modo de solo lectura';
      return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1a1a2e;border:2px solid #00ff41;border-radius:8px;padding:24px;width:520px;max-height:80vh;overflow-y:auto;color:#e0e0e0;font-family:Courier New,monospace;';

    // Build busbar selection UI
    let busbarOptionsHtml = '';
    const categories = {
      power: { name: '⚡ Alimentación AC', busbars: ['L1', 'L2', 'L3', 'N', 'PE'] },
      control: { name: '🔧 Control DC', busbars: ['DC24V', 'DC0V'] }
    };

    Object.entries(categories).forEach(([catKey, catInfo]) => {
      busbarOptionsHtml += `<div class="busbar-category" style="margin-bottom:20px;">
        <h4 style="color:#00ff41;margin-bottom:12px;font-size:14px;">${catInfo.name}</h4>`;
      
      catInfo.busbars.forEach(busbarId => {
        const busbar = BUSBAR_TYPES[busbarId];
        if (!busbar) return;
        
        const isActive = this.activeBusbars.includes(busbarId);
        busbarOptionsHtml += `
          <div class="busbar-option" style="display:flex;align-items:center;margin-bottom:8px;padding:8px;background:${isActive ? '#003322' : '#1a1a1a'};border-radius:4px;border:1px solid ${isActive ? busbar.color : '#333'};">
            <input type="checkbox" id="busbar-${busbarId}" ${isActive ? 'checked' : ''} 
              style="margin-right:12px;width:16px;height:16px;accent-color:${busbar.color};" />
            <div style="flex:1;">
              <label for="busbar-${busbarId}" style="cursor:pointer;color:${busbar.color};font-weight:bold;font-size:12px;">
                ${busbar.name}
              </label>
              <div style="font-size:10px;color:#888;margin-top:2px;">
                ${busbar.description} — ${busbar.voltage} ${busbar.section}
              </div>
            </div>
            <div style="width:20px;height:4px;background:${busbar.color};border-radius:2px;"></div>
          </div>`;
      });
      
      busbarOptionsHtml += '</div>';
    });

    modal.innerHTML = `
      <h2 style="color:#00ff41;margin:0 0 16px;font-size:18px;">⚡ Configurar Barras Horizontales</h2>
      <p style="font-size:11px;color:#888;margin-bottom:20px;">
        Selecciona las barras de alimentación que se mostrarán en la página actual: 
        <strong style="color:#00ff41;">${this.pages[this.currentPageIndex].name}</strong>
      </p>
      
      ${busbarOptionsHtml}
      
      <div style="border-top:1px solid #333;padding-top:16px;margin-top:20px;">
        <p style="font-size:10px;color:#666;margin-bottom:16px;">
          💡 <strong>Tip:</strong> Las barras aparecerán en la parte superior del diagrama y permitirán conectar componentes directamente.
        </p>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button id="busbar-cancel" style="padding:8px 18px;background:#333;color:#ccc;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;">
            Cancelar
          </button>
          <button id="busbar-save" style="padding:8px 18px;background:#00ff41;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;font-size:12px;">
            ⚡ Aplicar Barras
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Cancel button
    modal.querySelector('#busbar-cancel').addEventListener('click', () => overlay.remove());

    // Save button
    modal.querySelector('#busbar-save').addEventListener('click', () => {
      const newActiveBusbars = [];
      
      // Collect selected busbars
      Object.keys(BUSBAR_TYPES).forEach(busbarId => {
        const checkbox = modal.querySelector(`#busbar-${busbarId}`);
        if (checkbox && checkbox.checked) {
          newActiveBusbars.push(busbarId);
        }
      });

      // Update active busbars
      this.activeBusbars = newActiveBusbars;
      
      // Clean up busbar connections for deactivated busbars
      this.busbarConnections = this.busbarConnections.filter(conn => 
        newActiveBusbars.includes(conn.busbarId)
      );

      // Save to current page
      this._saveCurrentPage();

      // Close modal
      overlay.remove();

      // Re-render
      this.render();

      // Update status
      const activeCount = newActiveBusbars.length;
      if (activeCount === 0) {
        this.statusEl.textContent = '⚡ Todas las barras desactivadas';
      } else {
        const activeNames = newActiveBusbars.map(id => BUSBAR_TYPES[id]?.name || id).join(', ');
        this.statusEl.textContent = `⚡ Barras activas: ${activeNames} (${activeCount})`;
      }
    });

    // Focus save button
    setTimeout(() => modal.querySelector('#busbar-save').focus(), 100);
  }

  // ============================================
  // EDITAR CAJETÍN (Title Block Editor)
  // ============================================
  editTitleBlock() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';

    const d = this.diagram;
    const author = window.CRGM?.auth?.getCurrentUser()?.name || d.titleBlock?.author || 'CRGM';

    // Initialize titleBlock defaults if not present
    if (!d.titleBlock) {
      d.titleBlock = {};
    }
    const tb = d.titleBlock;

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1a1a2e;border:2px solid #00ff41;border-radius:8px;padding:24px;width:560px;max-height:85vh;overflow-y:auto;color:#e0e0e0;font-family:Courier New,monospace;';
    modal.innerHTML = `
      <h2 style="color:#00ff41;margin:0 0 16px;font-size:16px;">✏️ Editar Cajetín IEC</h2>
      <p style="font-size:11px;color:#888;margin-bottom:16px;">Estos datos se utilizan en la vista previa PDF / impresión del diagrama.</p>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="grid-column:1/3;">
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Nombre del Proyecto</label>
          <input type="text" id="tb-name" value="${this._escHtml(d.name || '')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Código de Máquina</label>
          <input type="text" id="tb-machineCode" value="${this._escHtml(d.machineCode || 'CRGM')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Job Nr.</label>
          <input type="text" id="tb-jobNr" value="${this._escHtml(d.jobNr || '0001')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Comisión</label>
          <input type="text" id="tb-comision" value="${this._escHtml(d.comision || '')}" placeholder="Ej: COM12345" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Número de Diseño</label>
          <input type="text" id="tb-designNr" value="${this._escHtml(String(d.designNr || ''))}" placeholder="Ej: 4607001" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Autor / Diseñador</label>
          <input type="text" id="tb-author" value="${this._escHtml(tb.author || author)}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Empresa / Cliente</label>
          <input type="text" id="tb-client" value="${this._escHtml(d.client || 'CORRUGADORA GUATEMALA')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Comprobador</label>
          <input type="text" id="tb-checker" value="${this._escHtml(d.checker || '')}" placeholder="Nombre de quien revisa" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div>
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Clasificación IP</label>
          <select id="tb-ipRating" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;">
            <option value="IP20" ${(d.ipRating === 'IP20') ? 'selected' : ''}>IP20</option>
            <option value="IP31" ${(d.ipRating === 'IP31') ? 'selected' : ''}>IP31</option>
            <option value="IP42" ${(d.ipRating === 'IP42') ? 'selected' : ''}>IP42</option>
            <option value="IP54" ${(!d.ipRating || d.ipRating === 'IP54') ? 'selected' : ''}>IP54</option>
            <option value="IP55" ${(d.ipRating === 'IP55') ? 'selected' : ''}>IP55</option>
            <option value="IP65" ${(d.ipRating === 'IP65') ? 'selected' : ''}>IP65</option>
            <option value="IP66" ${(d.ipRating === 'IP66') ? 'selected' : ''}>IP66</option>
            <option value="IP67" ${(d.ipRating === 'IP67') ? 'selected' : ''}>IP67</option>
          </select>
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Nombre de Empresa (Logo en cajetín)</label>
          <input type="text" id="tb-companyName" value="${this._escHtml(tb.companyName || '⚡ CRGM')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">Dirección / Info contacto (Logo)</label>
          <textarea id="tb-companyAddr" rows="2" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:11px;resize:vertical;">${this._escHtml(tb.companyAddr || 'Sistema de Gestión de Diagramas Eléctricos\nNomenclatura IEC 750 / CEI 3-34')}</textarea>
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:10px;color:#aaa;display:block;margin-bottom:2px;">E-mail contacto</label>
          <input type="text" id="tb-companyEmail" value="${this._escHtml(tb.companyEmail || 'soporte@crgm.app')}" style="width:100%;padding:6px 8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px;font-family:inherit;font-size:12px;" />
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end;">
        <button id="tb-cancel" style="padding:8px 18px;background:#333;color:#ccc;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;">Cancelar</button>
        <button id="tb-save" style="padding:8px 18px;background:#00ff41;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:inherit;font-size:12px;">💾 Guardar Cajetín</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Cancel
    modal.querySelector('#tb-cancel').addEventListener('click', () => overlay.remove());

    // Save
    modal.querySelector('#tb-save').addEventListener('click', () => {
      d.name = modal.querySelector('#tb-name').value.trim() || d.name;
      d.machineCode = modal.querySelector('#tb-machineCode').value.trim() || 'CRGM';
      d.jobNr = modal.querySelector('#tb-jobNr').value.trim() || '0001';
      d.comision = modal.querySelector('#tb-comision').value.trim() || '';
      d.designNr = modal.querySelector('#tb-designNr').value.trim() || '';
      d.client = modal.querySelector('#tb-client').value.trim() || '';
      d.checker = modal.querySelector('#tb-checker').value.trim() || '';
      d.ipRating = modal.querySelector('#tb-ipRating').value;

      // Title block specific fields
      d.titleBlock = d.titleBlock || {};
      d.titleBlock.author = modal.querySelector('#tb-author').value.trim() || 'CRGM';
      d.titleBlock.companyName = modal.querySelector('#tb-companyName').value.trim() || '⚡ CRGM';
      d.titleBlock.companyAddr = modal.querySelector('#tb-companyAddr').value.trim() || '';
      d.titleBlock.companyEmail = modal.querySelector('#tb-companyEmail').value.trim() || '';

      overlay.remove();
      this.statusEl.textContent = '✅ Cajetín actualizado correctamente';
    });

    // Focus first field
    setTimeout(() => modal.querySelector('#tb-name').focus(), 100);
  }

  // Helper to escape HTML in template literals
  _escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ============================================
  // PDF PREVIEW WITH CAJETÍN IEC (Title Block)
  // ============================================
  showPDFPreview() {
    this._saveCurrentPage();
    const page = this.pages[this.currentPageIndex];
    const pt = PAGE_TYPES[page.type] || PAGE_TYPES.general;
    const date = new Date().toLocaleDateString('es-GT');
    const diagramName = this.diagram.name;
    const pageNum = this.currentPageIndex + 1;
    const totalPages = this.pages.length;
    const tb = this.diagram.titleBlock || {};
    const author = tb.author || window.CRGM?.auth?.getCurrentUser()?.name || 'CRGM';
    const companyName = tb.companyName || '⚡ CRGM';
    const companyAddr = (tb.companyAddr || 'Sistema de Gestión de\nDiagramas Eléctricos\nNomenclatura IEC 750 / CEI 3-34').replace(/\n/g, '<br>');
    const companyEmail = tb.companyEmail || 'soporte@crgm.app';
    const version = this.diagram.version || 1;
    const iecSection = pt.iecCode || '+Q0';
    const machineCode = this.diagram.machineCode || 'CRGM';
    const jobNr = this.diagram.jobNr || '0001';
    const comision = this.diagram.comision || `COM${Date.now().toString().slice(-5)}`;
    const designNr = this.diagram.designNr || Math.floor(Math.random() * 9000000 + 1000000);
    
    const printWin = window.open('', '_blank', 'width=1200,height=850');
    if (!printWin) {
      this.statusEl.textContent = '⚠️ Permite ventanas emergentes para ver el PDF';
      return;
    }

    const imgData = this.canvas.toDataURL('image/png');

    // ═══════════════════════════════════════════════════════
    // CAJETÍN ESTILO - Extraído de diagrama SPH(1)
    // Ref: 4607COM17310 Single Preheater B.0
    // Nomenclatura IEC 750 / CEI 3-34
    // ═══════════════════════════════════════════════════════
    printWin.document.write(`<!DOCTYPE html>
<html><head><title>${diagramName} - ${page.name}</title>
<style>
  @page { size: A3 landscape; margin: 8mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; background: #fff; color: #000; font-size: 9px; }
  .sheet {
    width: 100%; max-width: 1140px; margin: 0 auto;
    border: 2.5px solid #000; position: relative;
    page-break-after: always;
  }

  /* === Column headers (top ruler) === */
  .col-headers { display: flex; border-bottom: 1.5px solid #000; background: #f5f5f5; }
  .col-header { flex: 1; text-align: center; font-size: 8px; padding: 2px 0;
    border-right: 0.5px solid #999; font-weight: bold; }
  .col-header:last-child { border-right: none; }

  /* === Diagram area === */
  .diagram-img { width: 100%; display: block; background: #fafafa; min-height: 400px; }

  /* === Cross-reference bar === */
  .xref-bar { font-size: 7px; padding: 2px 6px; background: #fffde8;
    border-top: 1px solid #000; border-bottom: 1px solid #000; color: #333; }

  /* ═══════════════════════════════════════ */
  /* CAJETÍN IEC (Title Block)           */
  /* Estructura exacta del diagrama SPH(1)  */
  /* ═══════════════════════════════════════ */
  .cajetin {
    display: grid;
    grid-template-columns: 220px 1fr 120px 80px 60px;
    grid-template-rows: auto auto auto auto;
    border-top: 2.5px solid #000;
    font-size: 8px;
    line-height: 1.3;
  }

  .cj { border: 0.5px solid #000; padding: 3px 5px; }
  .cj-bold { font-weight: bold; }
  .cj-center { text-align: center; }
  .cj-small { font-size: 7px; color: #555; }
  .cj-title { font-size: 10px; font-weight: bold; }

  /* Row 1: Company logo + Page description + Section + Sheet info */
  .cj-logo {
    grid-row: 1 / 5; grid-column: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: #f8f8f8; border: 1px solid #000;
    padding: 6px;
  }
  .cj-logo-name { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
  .cj-logo-addr { font-size: 6.5px; color: #666; text-align: center; margin-top: 3px; line-height: 1.2; }
  .cj-logo-contact { font-size: 6px; color: #888; text-align: center; margin-top: 2px; }

  .cj-desc {
    grid-column: 2; font-size: 9px; font-weight: bold;
    display: flex; flex-direction: column; justify-content: center;
  }
  .cj-desc-es { color: #000; }
  .cj-desc-it { color: #666; font-size: 7px; font-style: italic; }

  .cj-section { font-weight: bold; text-align: center; font-size: 10px; }
  .cj-section-code { font-size: 7px; color: #555; }

  .cj-sheet { text-align: center; }
  .cj-sheet-label { font-size: 7px; color: #666; }
  .cj-sheet-num { font-size: 14px; font-weight: bold; }

  /* Row 2: Machine type + Drawing name + Rev + Date */
  .cj-machine { font-size: 8px; }
  .cj-machine-label { font-size: 6.5px; color: #777; }

  /* Row 3: Job/Comision + Author + Design number */
  .cj-field-label { font-size: 6px; color: #888; display: block; }
  .cj-field-value { font-size: 8px; font-weight: bold; }

  /* Row 4: Project description + stats */
  .cj-project { font-size: 8px; }

  /* Nomenclature footer */
  .cj-nomenclature {
    grid-column: 1 / 6;
    font-size: 6.5px; color: #666;
    padding: 2px 6px;
    border-top: 1px solid #000;
    background: #fafafa;
    display: flex; justify-content: space-between;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { border: 2px solid #000; }
  }
</style></head><body>
  <div class="sheet">
    <!-- Column headers -->
    <div class="col-headers">
      ${Array.from({length: 10}, (_, i) => `<div class="col-header">${i + 1}</div>`).join('')}
    </div>

    <!-- Diagram -->
    <img class="diagram-img" src="${imgData}" />

    <!-- Cross-reference bar -->
    <div class="xref-bar">${this._getXRefText(page)}</div>

    <!-- ═══ CAJETÍN IEC ═══ -->
    <div class="cajetin">

      <!-- ROW 1 -->
      <div class="cj cj-logo">
        <div class="cj-logo-name">${companyName}</div>
        <div class="cj-logo-addr">
          ${companyAddr}
        </div>
        <div class="cj-logo-contact">
          E-mail: ${companyEmail}
        </div>
      </div>

      <div class="cj cj-desc">
        <div class="cj-desc-es">${page.name}</div>
        <div class="cj-desc-it">${pt.name}</div>
      </div>

      <div class="cj cj-section cj-center">
        <div>${machineCode}</div>
        <div class="cj-section-code">${iecSection}</div>
      </div>

      <div class="cj cj-center" style="font-size:7px;">
        <span class="cj-field-label">Fecha</span>
        <div class="cj-field-value">${date}</div>
      </div>

      <div class="cj cj-sheet cj-center">
        <div class="cj-sheet-label">Hoja</div>
        <div class="cj-sheet-num">${pageNum}</div>
        <div class="cj-sheet-label">${totalPages}</div>
      </div>

      <!-- ROW 2 -->
      <div class="cj">
        <span class="cj-field-label">Nombre de proyecto / Nombre di progetto</span>
        <div class="cj-field-value">${diagramName}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Número de diseño</span>
        <div class="cj-field-value">${designNr}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Rev.</span>
        <div class="cj-field-value">${version}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Comp.</span>
        <div class="cj-field-value">${this.components.length}</div>
      </div>

      <!-- ROW 3 -->
      <div class="cj" style="display:flex;gap:12px;">
        <div>
          <span class="cj-field-label">Job nr.</span>
          <div class="cj-field-value">${jobNr}</div>
        </div>
        <div>
          <span class="cj-field-label">Comisión</span>
          <div class="cj-field-value">${comision}</div>
        </div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Autor</span>
        <div class="cj-field-value">${author}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Modo</span>
        <div class="cj-field-value">${WORK_MODES[this.workMode].icon} ${WORK_MODES[this.workMode].name}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Cables</span>
        <div class="cj-field-value">${this.wires.length}</div>
      </div>

      <!-- ROW 4 -->
      <div class="cj" style="display:flex;gap:12px;">
        <div>
          <span class="cj-field-label">Empresa/cliente</span>
          <div class="cj-field-value">${this.diagram.client || 'CORRUGADORA GUATEMALA'}</div>
        </div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Comprobación</span>
        <div class="cj-field-value">${this.diagram.checker || '—'}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">Tipo</span>
        <div class="cj-field-value">${pt.icon}</div>
      </div>

      <div class="cj cj-center">
        <span class="cj-field-label">IP</span>
        <div class="cj-field-value">${this.diagram.ipRating || 'IP54'}</div>
      </div>

      <!-- NOMENCLATURE FOOTER -->
      <div class="cj-nomenclature">
        <span>= Código principal | + Ubicación | - Componente | : Borne — IEC 750 / CEI 3-34</span>
        <span>Conductores: Azul 0.75mm² AWG18 (defecto) — EN 60204-1</span>
        <span>Generado: ${new Date().toISOString().slice(0, 19)}</span>
      </div>
    </div>
  </div>
  <script>setTimeout(() => window.print(), 500);<\/script>
</body></html>`);
    printWin.document.close();
    this.statusEl.textContent = '🖨️ Vista previa PDF (Cajetín IEC) abierta';
  }

  _getXRefText(page) {
    // Build cross-reference text for components that appear on multiple pages
    const labels = new Set((page.elements || []).map(e => e.label));
    const refs = [];
    this.pages.forEach((p, i) => {
      if (p.id === page.id) return;
      (p.elements || []).forEach(el => {
        if (labels.has(el.label)) {
          refs.push(`${el.label} → Hoja ${i + 1} (${p.name})`);
        }
      });
    });
    return refs.length > 0 ? `Ref. Cruzadas: ${refs.join(' | ')}` : 'Sin referencias cruzadas';
  }

  // ============================================
  // CROSS-REFERENCES PANEL
  // ============================================
  showCrossReferences() {
    this._saveCurrentPage();
    
    // Build global component index across all pages
    const compIndex = {};  // label -> [{pageIndex, pageName, col, row}]
    this.pages.forEach((page, pi) => {
      (page.elements || []).forEach(el => {
        if (!compIndex[el.label]) compIndex[el.label] = [];
        compIndex[el.label].push({
          pageIndex: pi,
          pageName: page.name,
          pageType: page.type,
          col: el.col + 1,
          row: el.row + 1
        });
      });
    });

    // Filter to only cross-references (appear on multiple pages)
    const xrefs = Object.entries(compIndex).filter(([_, locs]) => locs.length > 1);
    
    // Show in inspector panel
    let html = '<h3>🔀 Referencias Cruzadas</h3>';
    
    if (xrefs.length === 0) {
      html += '<p style="color:#808080;font-size:0.85rem;padding:8px;">No hay componentes compartidos entre hojas.<br><br>Cuando un mismo componente (misma etiqueta) aparece en varias hojas, se mostrará la referencia cruzada aquí.</p>';
    } else {
      xrefs.forEach(([label, locs]) => {
        html += `<div class="de-xref-item"><strong>${label}</strong>`;
        locs.forEach(loc => {
          const pt = PAGE_TYPES[loc.pageType] || PAGE_TYPES.general;
          html += `<div class="de-xref-loc" data-page="${loc.pageIndex}">
            ${pt.icon} ${loc.pageName} — Col ${loc.col}, Fila ${loc.row}
          </div>`;
        });
        html += '</div>';
      });
    }

    // Summary table
    html += '<hr style="border-color:#333;margin:12px 0;">';
    html += '<h4 style="color:#aaa;font-size:0.8rem;">Resumen por hoja</h4>';
    this.pages.forEach((page, i) => {
      const pt = PAGE_TYPES[page.type] || PAGE_TYPES.general;
      const elCount = (page.elements || []).length;
      const wCount = (page.wires || []).length;
      html += `<div class="de-xref-summary" data-page="${i}">
        ${pt.icon} <strong>${page.name}</strong>: ${elCount} comp, ${wCount} cables
      </div>`;
    });

    this.inspectorEl.innerHTML = html;
    
    // Bind click to navigate to page
    this.inspectorEl.querySelectorAll('[data-page]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        this.switchPage(parseInt(el.dataset.page));
      });
    });
    
    this.statusEl.textContent = `🔀 ${xrefs.length} referencias cruzadas encontradas`;
  }

  // ============================================
  // SAVE / LOAD (Multi-page aware)
  // ============================================
  async save() {
    try {
      this._saveCurrentPage();
      this.diagram.pages = this.pages;
      this.diagram.workMode = this.workMode;
      // Also keep flat elements/wires for backwards compatibility
      this.diagram.elements = this.components;
      this.diagram.wires = this.wires;
      this.diagram.counters = this.counters;
      this.diagram.updatedAt = Date.now();
      this.diagram.version = (this.diagram.version || 0) + 1;

      if (this._onSave) {
        await this._onSave(this.diagram);
      }
      this.statusEl.textContent = `💾 Guardado v${this.diagram.version} — ${this.pages.length} hojas`;
    } catch (err) {
      console.error('[editor] Error al guardar:', err);
      this.statusEl.textContent = '❌ Error al guardar: ' + err.message;
    }
  }

  onSave(callback) {
    this._onSave = callback;
  }

  // ============================================
  // EXPORT CSV
  // ============================================
  exportCSV() {
    this._saveCurrentPage();
    
    // Multi-page BOM with extended props
    let bomCSV = 'Referencia,Tipo,Hoja,Hoja_Nombre,Columna,Fila,Descripcion,Fabricante,N_Parte,Voltaje,Corriente,Potencia\n';
    let cableCSV = 'Cable_ID,Hoja,Desde_Ref,Desde_Terminal,Hacia_Ref,Hacia_Terminal,Seccion_mm2,Color,Tipo_Cable,Longitud_m\n';
    let totalComps = 0, totalWires = 0;

    this.pages.forEach((page, pi) => {
      const pt = PAGE_TYPES[page.type] || PAGE_TYPES.general;
      (page.elements || []).forEach(comp => {
        const def = IEC_COMPONENTS[comp.type];
        const p = comp.props || {};
        bomCSV += `${comp.label},${def ? def.name : comp.type},${pi + 1},${page.name},${comp.col + 1},${comp.row + 1},${p.description || ''},${p.manufacturer || ''},${p.partNumber || ''},${p.voltage || ''},${p.current || ''},${p.power || ''}\n`;
        totalComps++;
      });
      (page.wires || []).forEach((wire, wi) => {
        const fromComp = (page.elements || []).find(c => c.id === wire.from);
        const toComp = (page.elements || []).find(c => c.id === wire.to);
        cableCSV += `W${pi + 1}.${wi + 1},${page.name},${fromComp ? fromComp.label : '?'},${wire.fromTerminal},${toComp ? toComp.label : '?'},${wire.toTerminal},${wire.section || '1.5'},${wire.color || 'Negro'},${wire.cableType || 'H07V-K'},${wire.length || ''}\n`;
        totalWires++;
      });
    });

    if (totalComps === 0) {
      this.statusEl.textContent = '⚠️ No hay componentes para exportar';
      return;
    }

    this._downloadFile(`${this.diagram.name}_BOM.csv`, bomCSV);
    setTimeout(() => this._downloadFile(`${this.diagram.name}_Cables.csv`, cableCSV), 500);
    this.statusEl.textContent = `📤 CSV exportado: ${totalComps} componentes, ${totalWires} cables (${this.pages.length} hojas)`;
  }

  _downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============================================
  // IMPORT CSV
  // ============================================
  importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', () => {
      const files = Array.from(input.files);
      if (files.length === 0) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          this._parseCSV(text, file.name);
        };
        reader.readAsText(file);
      });

      document.body.removeChild(input);
    });

    input.click();
  }

  _parseCSV(text, filename) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      this.statusEl.textContent = '⚠️ CSV vacío o inválido';
      return;
    }

    const header = lines[0].toLowerCase();

    if (header.includes('referencia') && header.includes('tipo')) {
      // BOM file
      this._importBOM(lines);
    } else if (header.includes('cable_id') && header.includes('desde_ref')) {
      // Cable list
      this._importCables(lines);
    } else {
      this.statusEl.textContent = '⚠️ Formato CSV no reconocido. Use BOM o Lista de Cables.';
    }
  }

  _importBOM(lines) {
    let count = 0;
    const typeMap = {};
    // Build reverse map from name to type key
    Object.entries(IEC_COMPONENTS).forEach(([key, def]) => {
      typeMap[def.name.toLowerCase()] = key;
      typeMap[key] = key;
    });

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      if (parts.length < 4) continue;

      const [label, typeName, sheet, colStr, rowStr] = parts;
      const col = parseInt(colStr) - 1;
      const row = parseInt(rowStr) - 1;

      // Resolve type
      let type = typeMap[typeName.toLowerCase()];
      if (!type) {
        // Try partial match
        for (const [key, val] of Object.entries(typeMap)) {
          if (typeName.toLowerCase().includes(key)) { type = val; break; }
        }
      }
      if (!type) type = 'contact_no'; // fallback

      if (isNaN(col) || isNaN(row)) continue;
      if (this._getComponentAt(col, row)) continue;

      // Ensure rows exist
      if (row >= this.ROWS) {
        this.ROWS = row + 2;
      }

      this.components.push({
        id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: type,
        label: label || this._nextLabel(type),
        col: col,
        row: row,
        props: {}
      });
      count++;
    }

    this._handleResize();
    this.statusEl.textContent = `📥 BOM importado: ${count} componentes`;
  }

  _importCables(lines) {
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      if (parts.length < 5) continue;

      const [cableId, fromLabel, fromTerm, toLabel, toTerm] = parts;
      const fromComp = this.components.find(c => c.label === fromLabel);
      const toComp = this.components.find(c => c.label === toLabel);

      if (!fromComp || !toComp) continue;

      const exists = this.wires.find(w =>
        (w.from === fromComp.id && w.to === toComp.id) ||
        (w.from === toComp.id && w.to === fromComp.id)
      );
      if (exists) continue;

      this.wires.push({
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        from: fromComp.id,
        fromTerminal: fromTerm || 'bottom',
        to: toComp.id,
        toTerminal: toTerm || 'top'
      });
      count++;
    }

    this.render();
    this.statusEl.textContent = `📥 Cables importados: ${count} conexiones`;
  }

  // ============================================
  // PALETTE RENDERING
  // ============================================
  _renderPalette() {
    if (!this.paletteEl) return;
    
    let html = '<h3 class="de-palette-title">Componentes IEC</h3>';
    
    CATEGORIES.forEach(cat => {
      html += `<div class="de-palette-category">
        <div class="de-palette-cat-title">${cat.name}</div>`;
      
      cat.types.forEach(typeKey => {
        const def = IEC_COMPONENTS[typeKey];
        if (!def) return;
        
        html += `
          <button class="de-palette-item" data-type="${typeKey}" title="${def.name} (${def.prefix})">
            <span class="de-palette-dot" style="background:${def.color}"></span>
            <span class="de-palette-name">${def.name}</span>
          </button>`;
      });
      
      html += '</div>';
    });
    
    this.paletteEl.innerHTML = html;
    
    // Bind palette item clicks
    this.paletteEl.querySelectorAll('.de-palette-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isReadonly) {
          this.statusEl.textContent = '⚠️ No se puede colocar componentes en modo de solo lectura';
          return;
        }
        
        const type = btn.dataset.type;
        const def = IEC_COMPONENTS[type];
        
        // Toggle placement mode
        if (this.placingType === type) {
          this.placingType = null;
          btn.classList.remove('active');
          this.statusEl.textContent = '❌ Colocación cancelada';
        } else {
          this.placingType = type;
          this.paletteEl.querySelectorAll('.de-palette-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.statusEl.textContent = `✏️ Click en el grid para colocar: ${def.name} (${def.prefix})`;
        }
        
        this.canvas.style.cursor = this.placingType ? 'crosshair' : 'default';
      });
    });
  }

  // ============================================
  // CLEANUP
  // ============================================
  destroy() {
    window.removeEventListener('resize', this._boundResize);
    // ⚡ Remove keyboard shortcuts listener
    if (this._boundKeyHandler) {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }
  }

  // ============================================
  // GET STATE FOR SERIALIZATION
  // ============================================
  getState() {
    return {
      elements: this.components,
      wires: this.wires,
      counters: this.counters,
      rows: this.ROWS
    };
  }
}

export { DiagramEditor, IEC_COMPONENTS, CATEGORIES };
export default DiagramEditor;
