# 🧩 PLANTILLA DE MÓDULO CRGM-API

## 📋 Estructura Estándar de Módulo

Cada módulo debe seguir este patrón para garantizar la compatibilidad con el sistema modular.

---

## 📄 Archivo: `src/js/modules/ejemplo.js`

```javascript
/**
 * MÓDULO: Ejemplo
 * Versión: 1.0.0
 * Descripción: Descripción breve del módulo
 * Dependencias: ['core.database', 'core.auth']
 */

const ModuloEjemplo = {
  // ============================================
  // CONFIGURACIÓN DEL MÓDULO
  // ============================================
  name: 'ejemplo',
  version: '1.0.0',
  description: 'Módulo de ejemplo para demostrar la estructura',
  author: 'CRGM Industrial Solutions',
  
  // Permisos requeridos para usar este módulo
  permissions: {
    read: 1,    // Nivel mínimo para leer (todos)
    write: 10,  // Nivel mínimo para escribir (técnicos+)
    delete: 50, // Nivel mínimo para eliminar (gerentes+)
    admin: 999  // Nivel mínimo para administrar (solo Token Rey)
  },
  
  // Módulos de los que depende este módulo
  dependencies: ['core.database', 'core.auth'],
  
  // Estado interno del módulo
  state: {
    initialized: false,
    data: {},
    cache: new Map()
  },

  // ============================================
  // CICLO DE VIDA DEL MÓDULO
  // ============================================
  
  /**
   * Inicializar el módulo
   * Se llama automáticamente al cargar el módulo
   */
  async init() {
    console.log(`[${this.name}] Inicializando...`);
    
    try {
      // Verificar dependencias
      await this.checkDependencies();
      
      // Inicializar base de datos
      await this.initDatabase();
      
      // Registrar event listeners
      this.registerEvents();
      
      // Cargar configuración guardada
      await this.loadConfig();
      
      this.state.initialized = true;
      console.log(`[${this.name}] ✓ Inicializado correctamente`);
      
      return true;
    } catch (error) {
      console.error(`[${this.name}] ✗ Error en inicialización:`, error);
      return false;
    }
  },
  
  /**
   * Destruir el módulo
   * Se llama al desactivar o recargar el módulo
   */
  async destroy() {
    console.log(`[${this.name}] Destruyendo...`);
    
    // Remover event listeners
    this.unregisterEvents();
    
    // Limpiar cache
    this.state.cache.clear();
    
    // Guardar estado antes de destruir
    await this.saveState();
    
    this.state.initialized = false;
    console.log(`[${this.name}] ✓ Destruido correctamente`);
  },
  
  /**
   * Verificar que las dependencias estén disponibles
   */
  async checkDependencies() {
    for (const dep of this.dependencies) {
      const module = window.CRGM.modules.get(dep);
      if (!module || !module.state.initialized) {
        throw new Error(`Dependencia no disponible: ${dep}`);
      }
    }
  },

  // ============================================
  // INICIALIZACIÓN DE BASE DE DATOS
  // ============================================
  
  async initDatabase() {
    const db = window.CRGM.modules.get('core.database');
    
    // Verificar si el store existe, si no, crearlo
    const storeExists = await db.api.hasStore(this.name);
    
    if (!storeExists) {
      console.log(`[${this.name}] Creando object store...`);
      // En producción, esto requeriría incrementar la versión de la DB
      // y crear el store en el evento onupgradeneeded
    }
  },

  // ============================================
  // GESTIÓN DE EVENTOS
  // ============================================
  
  registerEvents() {
    // Eventos personalizados del módulo
    document.addEventListener('crgm:ejemplo:refresh', this.handleRefresh.bind(this));
    document.addEventListener('crgm:auth:logout', this.handleLogout.bind(this));
  },
  
  unregisterEvents() {
    document.removeEventListener('crgm:ejemplo:refresh', this.handleRefresh.bind(this));
    document.removeEventListener('crgm:auth:logout', this.handleLogout.bind(this));
  },
  
  handleRefresh(event) {
    console.log(`[${this.name}] Refrescando datos...`);
    // Lógica de refresco
  },
  
  handleLogout(event) {
    console.log(`[${this.name}] Limpiando datos de sesión...`);
    this.state.cache.clear();
  },

  // ============================================
  // API PÚBLICA DEL MÓDULO
  // ============================================
  
  api: {
    /**
     * Ejemplo: Obtener un elemento por ID
     * @param {string} id - ID del elemento
     * @returns {Promise<Object>} Elemento encontrado
     */
    async getById(id) {
      // Verificar permisos
      if (!this.checkPermission('read')) {
        throw new Error('Permisos insuficientes');
      }
      
      // Verificar cache primero
      if (this.state.cache.has(id)) {
        return this.state.cache.get(id);
      }
      
      // Si no está en cache, buscar en DB
      const db = window.CRGM.modules.get('core.database');
      const item = await db.api.get(this.name, id);
      
      // Guardar en cache
      if (item) {
        this.state.cache.set(id, item);
      }
      
      return item;
    },
    
    /**
     * Ejemplo: Crear un nuevo elemento
     * @param {Object} data - Datos del elemento
     * @returns {Promise<string>} ID del elemento creado
     */
    async create(data) {
      // Verificar permisos
      if (!this.checkPermission('write')) {
        throw new Error('Permisos insuficientes');
      }
      
      // Validar datos
      this.validate(data);
      
      // Agregar metadata
      const item = {
        ...data,
        id: this.generateId(),
        createdAt: Date.now(),
        createdBy: window.CRGM.auth.getCurrentUser().id,
        version: 1
      };
      
      // Guardar en DB
      const db = window.CRGM.modules.get('core.database');
      await db.api.add(this.name, item);
      
      // Actualizar cache
      this.state.cache.set(item.id, item);
      
      // Emitir evento
      this.emit('created', { id: item.id, data: item });
      
      // Registrar en audit log
      await this.logAction('create', item.id);
      
      return item.id;
    },
    
    /**
     * Ejemplo: Actualizar un elemento
     */
    async update(id, changes) {
      if (!this.checkPermission('write')) {
        throw new Error('Permisos insuficientes');
      }
      
      const item = await this.api.getById(id);
      if (!item) {
        throw new Error('Elemento no encontrado');
      }
      
      // Actualizar datos
      const updated = {
        ...item,
        ...changes,
        updatedAt: Date.now(),
        updatedBy: window.CRGM.auth.getCurrentUser().id,
        version: item.version + 1
      };
      
      // Guardar en DB
      const db = window.CRGM.modules.get('core.database');
      await db.api.put(this.name, updated);
      
      // Actualizar cache
      this.state.cache.set(id, updated);
      
      // Emitir evento
      this.emit('updated', { id, changes });
      
      // Registrar en audit log
      await this.logAction('update', id);
      
      return true;
    },
    
    /**
     * Ejemplo: Eliminar un elemento
     */
    async delete(id) {
      if (!this.checkPermission('delete')) {
        throw new Error('Permisos insuficientes');
      }
      
      const db = window.CRGM.modules.get('core.database');
      await db.api.delete(this.name, id);
      
      // Remover de cache
      this.state.cache.delete(id);
      
      // Emitir evento
      this.emit('deleted', { id });
      
      // Registrar en audit log
      await this.logAction('delete', id);
      
      return true;
    },
    
    /**
     * Ejemplo: Listar todos los elementos
     */
    async list(filter = {}) {
      if (!this.checkPermission('read')) {
        throw new Error('Permisos insuficientes');
      }
      
      const db = window.CRGM.modules.get('core.database');
      const items = await db.api.getAll(this.name);
      
      // Aplicar filtros si existen
      if (Object.keys(filter).length > 0) {
        return items.filter(item => this.matchFilter(item, filter));
      }
      
      return items;
    }
  },

  // ============================================
  // UTILIDADES INTERNAS
  // ============================================
  
  /**
   * Verificar si el usuario actual tiene el permiso requerido
   */
  checkPermission(action) {
    const auth = window.CRGM.modules.get('core.auth');
    const user = auth.api.getCurrentUser();
    
    if (!user) return false;
    
    const requiredLevel = this.permissions[action] || 999;
    return user.level >= requiredLevel;
  },
  
  /**
   * Validar estructura de datos
   */
  validate(data) {
    // Implementar validación específica del módulo
    if (!data) {
      throw new Error('Datos inválidos');
    }
    return true;
  },
  
  /**
   * Generar ID único
   */
  generateId() {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Verificar si un item coincide con un filtro
   */
  matchFilter(item, filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  },
  
  /**
   * Emitir evento personalizado
   */
  emit(eventName, detail = {}) {
    const event = new CustomEvent(`crgm:${this.name}:${eventName}`, {
      detail: { ...detail, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  },
  
  /**
   * Registrar acción en audit log
   */
  async logAction(action, targetId) {
    const logs = window.CRGM.modules.get('core.logs');
    if (logs) {
      await logs.api.add({
        module: this.name,
        action,
        targetId,
        timestamp: Date.now(),
        userId: window.CRGM.auth.getCurrentUser()?.id
      });
    }
  },
  
  /**
   * Cargar configuración del módulo
   */
  async loadConfig() {
    const config = localStorage.getItem(`crgm:${this.name}:config`);
    if (config) {
      this.state.config = JSON.parse(config);
    }
  },
  
  /**
   * Guardar estado del módulo
   */
  async saveState() {
    const state = {
      config: this.state.config,
      lastSync: Date.now()
    };
    localStorage.setItem(`crgm:${this.name}:config`, JSON.stringify(state));
  },

  // ============================================
  // RUTAS DEL MÓDULO (Opcional)
  // ============================================
  
  routes: {
    '/ejemplo': {
      title: 'Ejemplo',
      render: 'renderList',
      permissions: ['read']
    },
    '/ejemplo/:id': {
      title: 'Detalle de Ejemplo',
      render: 'renderDetail',
      permissions: ['read']
    },
    '/ejemplo/new': {
      title: 'Nuevo Ejemplo',
      render: 'renderForm',
      permissions: ['write']
    }
  },
  
  // ============================================
  // RENDERIZADO DE VISTAS
  // ============================================
  
  renderList() {
    return `
      <div class="module-container" data-module="${this.name}">
        <div class="module-header">
          <h1>Lista de Ejemplos</h1>
          <button onclick="CRGM.navigate('/ejemplo/new')">+ Nuevo</button>
        </div>
        <div id="ejemplo-list" class="module-content">
          <!-- Se carga dinámicamente -->
        </div>
      </div>
    `;
  },
  
  renderDetail(id) {
    return `
      <div class="module-container" data-module="${this.name}">
        <div class="module-header">
          <button onclick="CRGM.navigate('/ejemplo')">← Volver</button>
          <h1>Detalle</h1>
        </div>
        <div id="ejemplo-detail-${id}" class="module-content">
          <!-- Se carga dinámicamente -->
        </div>
      </div>
    `;
  },
  
  renderForm() {
    return `
      <div class="module-container" data-module="${this.name}">
        <h1>Nuevo Ejemplo</h1>
        <form id="ejemplo-form">
          <input type="text" name="nombre" placeholder="Nombre" required>
          <textarea name="descripcion" placeholder="Descripción"></textarea>
          <button type="submit">Guardar</button>
        </form>
      </div>
    `;
  }
};

// ============================================
// EXPORTAR MÓDULO
// ============================================

export default ModuloEjemplo;
```

---

## 🔧 GUÍA DE USO

### 1. Crear un Nuevo Módulo

```bash
# Copiar la plantilla
cp MODULE_TEMPLATE.md src/js/modules/mi-modulo.js

# Editar y personalizar:
# - Cambiar 'ejemplo' por el nombre de tu módulo
# - Definir permisos apropiados
# - Implementar la API específica
# - Agregar rutas si es necesario
```

### 2. Registrar el Módulo

En `src/js/core/modules.js`:

```javascript
import MiModulo from '../modules/mi-modulo.js';

// Registrar
ModuleManager.register(MiModulo);
```

### 3. Usar el Módulo

```javascript
// Obtener referencia al módulo
const miModulo = window.CRGM.modules.get('mi-modulo');

// Usar la API
const items = await miModulo.api.list();
const item = await miModulo.api.getById('123');
await miModulo.api.create({ nombre: 'Test' });
```

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

Al crear un nuevo módulo, verificar:

- [ ] Nombre único sin conflictos
- [ ] Permisos correctamente definidos
- [ ] Dependencias declaradas
- [ ] Método `init()` implementado
- [ ] Método `destroy()` implementado
- [ ] API pública documentada
- [ ] Validación de datos implementada
- [ ] Eventos emitidos correctamente
- [ ] Audit log registrado
- [ ] Cache implementado si aplica
- [ ] Rutas definidas si aplica
- [ ] Vistas renderizadas correctamente
- [ ] Pruebas básicas realizadas

---

## 🎯 MÓDULOS CORE OBLIGATORIOS

Estos módulos siempre deben estar disponibles:

1. **core.database** - Gestor de IndexedDB
2. **core.auth** - Sistema de autenticación
3. **core.modules** - Gestor de módulos
4. **core.router** - Sistema de rutas
5. **core.events** - Bus de eventos

---

## 🔐 NIVELES DE PERMISOS ESTÁNDAR

```
Nivel 1   = Usuario temporal (lectura limitada)
Nivel 10  = Técnico (lectura + escritura básica)
Nivel 50  = Gerente (gestión completa)
Nivel 999 = Token Rey (administración total)
```

---

**Creado**: 10 Febrero 2026  
**Versión**: 1.0.0  
**CRGM Industrial Solutions**
