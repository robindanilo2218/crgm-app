# 🚀 DESARROLLO FASE 1 - MVP CRGM-API
## Guía Completa de Implementación del Núcleo

**Objetivo**: Implementar el núcleo funcional de la aplicación en 6 archivos base.

---

## 📦 ENTREGABLES DE LA FASE 1

### Archivos a Crear (en orden):
1. `src/index.html` - Shell de la aplicación
2. `src/manifest.json` - Configuración PWA
3. `src/sw.js` - Service Worker
4. `src/css/industrial.css` - Estilos
5. `src/js/core/database.js` - Gestor IndexedDB
6. `src/js/core/auth.js` - Sistema de autenticación
7. `src/js/core/modules.js` - Gestor modular
8. `src/js/app.js` - Controlador principal

---

## 1️⃣ ESTRUCTURA DE CARPETAS

```bash
mkdir -p src/{css,js/{core,modules},assets/icons,lib}
```

---

## 2️⃣ CÓDIGO COMPLETO

### 📄 `src/index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#000000">
  <meta name="description" content="Sistema Operativo Industrial CRGM">
  
  <title>CRGM-API</title>
  
  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/assets/icons/icon-192.png">
  <link rel="apple-touch-icon" href="/assets/icons/icon-192.png">
  
  <!-- Estilos -->
  <link rel="stylesheet" href="/css/industrial.css">
</head>
<body>
  <!-- BARRA SUPERIOR -->
  <header id="app-header">
    <button id="menu-btn" class="icon-btn">☰</button>
    <h1 id="app-title">CRGM-API</h1>
    <div id="user-badge"></div>
  </header>

  <!-- MENÚ LATERAL -->
  <nav id="sidebar" class="sidebar hidden">
    <div class="sidebar-header">
      <h2>CRGM-API</h2>
      <button id="sidebar-close" class="icon-btn">✕</button>
    </div>
    <ul id="menu-list" class="menu-list">
      <!-- Se genera dinámicamente -->
    </ul>
    <div class="sidebar-footer">
      <button id="logout-btn" class="btn-danger">Cerrar Sesión</button>
    </div>
  </nav>

  <!-- CONTENIDO PRINCIPAL -->
  <main id="app-content">
    <div id="view-container">
      <!-- Las vistas se cargan aquí -->
    </div>
  </main>

  <!-- PANTALLA DE LOGIN -->
  <div id="login-screen" class="modal">
    <div class="modal-content">
      <h2>🔐 Autenticación</h2>
      <form id="login-form">
        <input type="text" id="token-input" placeholder="Ingresa tu Token" required autocomplete="off">
        <button type="submit" class="btn-primary">Acceder</button>
      </form>
      <div id="login-error" class="error-msg hidden"></div>
    </div>
  </div>

  <!-- NOTIFICACIONES TOAST -->
  <div id="toast-container"></div>

  <!-- LOADING OVERLAY -->
  <div id="loading-overlay" class="hidden">
    <div class="spinner"></div>
    <p>Cargando...</p>
  </div>

  <!-- Scripts -->
  <script type="module" src="/js/app.js"></script>
</body>
</html>
```

---

### 📄 `src/manifest.json`

```json
{
  "name": "CRGM-API - Sistema Operativo Industrial",
  "short_name": "CRGM-API",
  "description": "Gestión Industrial Offline-First",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "business"],
  "screenshots": [],
  "related_applications": [],
  "prefer_related_applications": false
}
```

---

### 📄 `src/sw.js` (Service Worker)

```javascript
const CACHE_NAME = 'crgm-api-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/industrial.css',
  '/js/app.js',
  '/js/core/database.js',
  '/js/core/auth.js',
  '/js/core/modules.js'
];

// Instalación
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch (Estrategia: Cache-First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        
        // Cache miss - fetch from network
        return fetch(event.request).then(response => {
          // Solo cachear respuestas exitosas
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
```

---

### 📄 `src/css/industrial.css`

```css
/* ============================================
   VARIABLES Y RESET
   ============================================ */
:root {
  --color-bg: #000000;
  --color-surface: #1a1a1a;
  --color-text: #e0e0e0;
  --color-text-dim: #808080;
  --color-success: #00ff41;
  --color-danger: #ff3300;
  --color-warning: #ff9900;
  --color-info: #00ddff;
  --color-border: #333333;
  
  --font-mono: 'Courier New', monospace;
  --font-sans: system-ui, -apple-system, sans-serif;
  
  --radius: 4px;
  --spacing: 8px;
  --header-height: 56px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ============================================
   LAYOUT
   ============================================ */
#app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-success);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing);
  z-index: 100;
}

#app-title {
  flex: 1;
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-success);
  font-family: var(--font-mono);
}

#app-content {
  margin-top: var(--header-height);
  padding: var(--spacing);
  min-height: calc(100vh - var(--header-height));
}

/* ============================================
   SIDEBAR
   ============================================ */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: var(--color-surface);
  border-right: 2px solid var(--color-success);
  transform: translateX(0);
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.sidebar.hidden {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: var(--spacing);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-list {
  flex: 1;
  list-style: none;
  padding: var(--spacing);
  overflow-y: auto;
}

.menu-list li {
  margin-bottom: calc(var(--spacing) / 2);
}

.menu-list a {
  display: block;
  padding: calc(var(--spacing) * 1.5);
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--radius);
  transition: background 0.2s;
}

.menu-list a:hover,
.menu-list a.active {
  background: var(--color-success);
  color: var(--color-bg);
}

.sidebar-footer {
  padding: var(--spacing);
  border-top: 1px solid var(--color-border);
}

/* ============================================
   BOTONES
   ============================================ */
button {
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  border-radius: var(--radius);
  padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2);
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
}

.btn-primary {
  background: var(--color-success);
  color: var(--color-bg);
}

.btn-primary:hover {
  filter: brightness(1.2);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
  width: 100%;
}

.btn-danger:hover {
  filter: brightness(1.2);
}

.icon-btn {
  background: transparent;
  color: var(--color-success);
  font-size: 1.5rem;
  padding: var(--spacing);
}

.icon-btn:hover {
  background: rgba(0, 255, 65, 0.1);
}

/* ============================================
   FORMULARIOS
   ============================================ */
input, textarea, select {
  width: 100%;
  padding: calc(var(--spacing) * 1.5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 1rem;
  margin-bottom: var(--spacing);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-success);
}

/* ============================================
   MODAL
   ============================================ */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: var(--color-surface);
  padding: calc(var(--spacing) * 3);
  border-radius: var(--radius);
  border: 2px solid var(--color-success);
  max-width: 400px;
  width: 90%;
}

.modal-content h2 {
  margin-bottom: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--color-success);
}

/* ============================================
   NOTIFICACIONES
   ============================================ */
#toast-container {
  position: fixed;
  top: calc(var(--header-height) + var(--spacing));
  right: var(--spacing);
  z-index: 400;
}

.toast {
  background: var(--color-surface);
  border-left: 4px solid var(--color-success);
  padding: calc(var(--spacing) * 1.5);
  margin-bottom: var(--spacing);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
  max-width: 300px;
}

.toast.error {
  border-left-color: var(--color-danger);
}

.toast.warning {
  border-left-color: var(--color-warning);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ============================================
   LOADING
   ============================================ */
#loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

#loading-overlay.hidden {
  display: none;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-success);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   UTILIDADES
   ============================================ */
.hidden {
  display: none !important;
}

.error-msg {
  color: var(--color-danger);
  text-align: center;
  margin-top: var(--spacing);
}

#user-badge {
  background: var(--color-success);
  color: var(--color-bg);
  padding: calc(var(--spacing) / 2) var(--spacing);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-family: var(--font-mono);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .sidebar {
    width: 80%;
  }
}
```

---

### 📄 `src/js/core/database.js`

```javascript
/**
 * CORE: Database Manager
 * Gestiona IndexedDB para almacenamiento offline
 */

const DB_NAME = 'crgm_industrial_db';
const DB_VERSION = 1;

const DatabaseManager = {
  name: 'core.database',
  version: '1.0.0',
  state: {
    initialized: false,
    db: null
  },

  async init() {
    console.log('[DB] Inicializando IndexedDB...');
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('[DB] Error al abrir base de datos');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.state.db = request.result;
        this.state.initialized = true;
        console.log('[DB] ✓ Base de datos lista');
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[DB] Creando estructura...');
        const db = event.target.result;
        
        // Object Stores principales
        if (!db.objectStoreNames.contains('assets')) {
          const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetsStore.createIndex('name', 'name', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('assetId', 'assetId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('inventory')) {
          const invStore = db.createObjectStore('inventory', { keyPath: 'id' });
          invStore.createIndex('code', 'code', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('token', 'token', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
    });
  },

  api: {
    // Obtener un registro por ID
    async get(storeName, id) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    // Obtener todos los registros
    async getAll(storeName) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    // Agregar un registro
    async add(storeName, data) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    // Actualizar un registro
    async put(storeName, data) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    // Eliminar un registro
    async delete(storeName, id) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    },
    
    // Limpiar un store completo
    async clear(storeName) {
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    }
  }
};

export default DatabaseManager;
```

---

### 📄 `src/js/core/auth.js`

```javascript
/**
 * CORE: Authentication System
 * Sistema de autenticación con tokens
 */

const AuthManager = {
  name: 'core.auth',
  version: '1.0.0',
  dependencies: ['core.database'],
  
  state: {
    initialized: false,
    currentUser: null,
    tokenRey: null
  },

  async init() {
    console.log('[AUTH] Inicializando...');
    
    // Verificar si existe Token Rey
    await this.checkTokenRey();
    
    // Verificar sesión guardada
    await this.checkStoredSession();
    
    this.state.initialized = true;
    console.log('[AUTH] ✓ Sistema listo');
    return true;
  },

  async checkTokenRey() {
    const db = window.CRGM.modules.get('core.database');
    const users = await db.api.getAll('users');
    
    const tokenRey = users.find(u => u.level === 999);
    
    if (!tokenRey) {
      // Crear Token Rey por defecto
      console.log('[AUTH] Creando Token Rey inicial...');
      const defaultToken = {
        id: 'user_rey',
        token: 'CRGM2026',
        name: 'Administrador',
        level: 999,
        createdAt: Date.now()
      };
      
      await db.api.add('users', defaultToken);
      this.state.tokenRey = defaultToken;
      
      console.log('[AUTH] ⚠️ Token Rey creado: CRGM2026');
    } else {
      this.state.tokenRey = tokenRey;
    }
  },

  async checkStoredSession() {
    const sessionData = localStorage.getItem('crgm_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Verificar que el token siga siendo válido
        const valid = await this.api.validateToken(session.token);
        if (valid) {
          this.state.currentUser = session.user;
          this.emit('login', { user: session.user });
        } else {
          localStorage.removeItem('crgm_session');
        }
      } catch (error) {
        console.error('[AUTH] Error al restaurar sesión:', error);
        localStorage.removeItem('crgm_session');
      }
    }
  },

  api: {
    async login(token) {
      const db = window.CRGM.modules.get('core.database');
      const users = await db.api.getAll('users');
      
      const user = users.find(u => u.token === token);
      
      if (!user) {
        throw new Error('Token inválido');
      }
      
      // Guardar sesión
      AuthManager.state.currentUser = user;
      localStorage.setItem('crgm_session', JSON.stringify({
        token: user.token,
        user: user,
        timestamp: Date.now()
      }));
      
      AuthManager.emit('login', { user });
      
      return user;
    },
    
    logout() {
      AuthManager.state.currentUser = null;
      localStorage.removeItem('crgm_session');
      AuthManager.emit('logout');
    },
    
    getCurrentUser() {
      return AuthManager.state.currentUser;
    },
    
    isAuthenticated() {
      return !!AuthManager.state.currentUser;
    },
    
    hasPermission(level) {
      const user = this.getCurrentUser();
      return user && user.level >= level;
    },
    
    async validateToken(token) {
      const db = window.CRGM.modules.get('core.database');
      const users = await db.api.getAll('users');
      return users.some(u => u.token === token);
    },
    
    async createUser(userData) {
      if (!this.hasPermission(999)) {
        throw new Error('Solo Token Rey puede crear usuarios');
      }
      
      const db = window.CRGM.modules.get('core.database');
      
      const newUser = {
        id: `user_${Date.now()}`,
        token: this.generateToken(),
        name: userData.name,
        level: userData.level || 10,
        createdAt: Date.now(),
        createdBy: this.getCurrentUser().id
      };
      
      await db.api.add('users', newUser);
      return newUser;
    },
    
    generateToken() {
      return Math.random().toString(36).substr(2, 12).toUpperCase();
    }
  },

  emit(eventName, detail = {}) {
    const event = new CustomEvent(`crgm:auth:${eventName}`, { detail });
    document.dispatchEvent(event);
  }
};

export default AuthManager;
```

---

### 📄 `src/js/core/modules.js`

```javascript
/**
 * CORE: Module Manager
 * Sistema modular para cargar/descargar módulos dinámicamente
 */

const ModuleManager = {
  name: 'core.modules',
  version: '1.0.0',
  
  state: {
    initialized: false,
    modules: new Map(),
    config: null
  },

  async init() {
    console.log('[MODULES] Inicializando gestor modular...');
    
    // Cargar configuración
    await this.loadConfig();
    
    this.state.initialized = true;
    console.log('[MODULES] ✓ Gestor listo');
    return true;
  },

  async loadConfig() {
    try {
      const response = await fetch('/CONFIG_MODULES.json');
      this.state.config = await response.json();
      console.log('[MODULES] Configuración cargada');
    } catch (error) {
      console.error('[MODULES] Error al cargar config:', error);
      this.state.config = { core: { modules: [] }, essential: { modules: [] } };
    }
  },

  api: {
    register(module) {
      if (!module.name) {
        console.error('[MODULES] Módulo sin nombre');
        return false;
      }
      
      ModuleManager.state.modules.set(module.name, module);
      console.log(`[MODULES] ✓ Registrado: ${module.name}`);
      return true;
    },
    
    get(moduleName) {
      return ModuleManager.state.modules.get(moduleName);
    },
    
    has(moduleName) {
      return ModuleManager.state.modules.has(moduleName);
    },
    
    async loadModule(moduleName) {
      const config = ModuleManager.state.config;
      
      // Buscar en todas las categorías
      let moduleConfig = null;
      for (const category of Object.values(config)) {
        if (category.modules) {
          moduleConfig = category.modules.find(m => m.id === moduleName);
          if (moduleConfig) break;
        }
      }
      
      if (!moduleConfig) {
        throw new Error(`Módulo no encontrado: ${moduleName}`);
      }
      
      if (!moduleConfig.enabled) {
        console.warn(`[MODULES] Módulo deshabilitado: ${moduleName}`);
        return false;
      }
      
      try {
        const modulePath = `/js/${moduleConfig.file}`;
        const module = await import(modulePath);
        
        this.register(module.default);
        
        // Inicializar si tiene método init
        if (module.default.init) {
          await module.default.init();
        }
        
        return true;
      } catch (error) {
        console.error(`[MODULES] Error al cargar ${moduleName}:`, error);
        return false;
      }
    },
    
    getAll() {
      return Array.from(ModuleManager.state.modules.values());
    },
    
    async unload(moduleName) {
      const module = ModuleManager.state.modules.get(moduleName);
      
      if (!module) {
        console.warn(`[MODULES] Módulo no encontrado: ${moduleName}`);
        return false;
      }
      
      // Llamar destroy si existe
      if (module.destroy) {
        await module.destroy();
      }
      
      ModuleManager.state.modules.delete(moduleName);
      console.log(`[MODULES] ✓ Descargado: ${moduleName}`);
      return true;
    }
  }
};

export default ModuleManager;
```

---

### 📄 `src/js/app.js`

```javascript
/**
 * CRGM-API - Controlador Principal
 * Punto de entrada de la aplicación
 */

import DatabaseManager from './core/database.js';
import AuthManager from './core/auth.js';
import ModuleManager from './core/modules.js';

// Namespace global
window.CRGM = {
  version: '1.0.0',
  modules: null,
  auth: null,
  db: null,
  ui: {}
};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
  console.log('🚀 CRGM-API Iniciando...');
  
  try {
    // 1. Registrar Service Worker
    await registerServiceWorker();
    
    // 2. Inicializar módulos core
    await initCoreModules();
    
    // 3. Configurar UI
    setupUI();
    
    // 4. Verificar autenticación
    checkAuth();
    
    console.log('✓ CRGM-API Lista');
    
  } catch (error) {
    console.error('✗ Error fatal:', error);
    showError('Error al inicializar la aplicación');
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Registrado:', registration.scope);
    } catch (error) {
      console.error('[SW] Error al registrar:', error);
    }
  }
}

async function initCoreModules() {
  // Registrar módulos core
  ModuleManager.api.register(DatabaseManager);
  ModuleManager.api.register(AuthManager);
  ModuleManager.api.register(ModuleManager);
  
  // Inicializar en orden
  await DatabaseManager.init();
  await AuthManager.init();
  await ModuleManager.init();
  
  // Exponer en namespace global
  window.CRGM.modules = ModuleManager;
  window.CRGM.auth = AuthManager.api;
  window.CRGM.db = DatabaseManager.api;
}

// ============================================
// UI Y EVENTOS
// ============================================

function setupUI() {
  // Menu toggle
  document.getElementById('menu-btn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-close').addEventListener('click', toggleSidebar);
  
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Eventos de autenticación
  document.addEventListener('crgm:auth:login', onLogin);
  document.addEventListener('crgm:auth:logout', onLogout);
  
  // Cerrar sidebar al hacer click fuera
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    
    if (!sidebar.contains(e.target) && e.target !== menuBtn && !sidebar.classList.contains('hidden')) {
      toggleSidebar();
    }
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  
  const token = document.getElementById('token-input').value.trim();
  const errorDiv = document.getElementById('login-error');
  
  if (!token) {
    showError('Ingresa un token', errorDiv);
    return;
  }
  
  showLoading(true);
  
  try {
    await window.CRGM.auth.login(token);
    // El evento crgm:auth:login manejará el resto
  } catch (error) {
    showError(error.message, errorDiv);
  } finally {
    showLoading(false);
  }
}

function handleLogout() {
  if (confirm('¿Cerrar sesión?')) {
    window.CRGM.auth.logout();
  }
}

function onLogin(event) {
  const user = event.detail.user;
  
  // Ocultar login screen
  document.getElementById('login-screen').classList.add('hidden');
  
  // Actualizar UI
  document.getElementById('user-badge').textContent = `${user.name} (Lv ${user.level})`;
  
  // Construir menu
  buildMenu(user.level);
  
  // Mostrar vista principal
  renderHome();
  
  showToast(`Bienvenido, ${user.name}!`, 'success');
}

function onLogout() {
  // Mostrar login screen
  document.getElementById('login-screen').classList.remove('hidden');
  
  // Limpiar UI
  document.getElementById('user-badge').textContent = '';
  document.getElementById('token-input').value = '';
  
  // Limpiar vista
  document.getElementById('view-container').innerHTML = '';
  
  showToast('Sesión cerrada', 'info');
}

function checkAuth() {
  const isAuth = window.CRGM.auth.isAuthenticated();
  
  if (isAuth) {
    document.getElementById('login-screen').classList.add('hidden');
    const user = window.CRGM.auth.getCurrentUser();
    document.getElementById('user-badge').textContent = `${user.name} (Lv ${user.level})`;
    buildMenu(user.level);
    renderHome();
  } else {
    document.getElementById('login-screen').classList.remove('hidden');
  }
}

// ============================================
// NAVEGACIÓN Y VISTAS
// ============================================

function buildMenu(userLevel) {
  const menuList = document.getElementById('menu-list');
  menuList.innerHTML = '';
  
  const menuItems = [
    { title: 'Inicio', route: '/', level: 1 },
    { title: 'Escanear', route: '/scanner', level: 1 },
    { title: 'Activos', route: '/assets', level: 1 },
    { title: 'Inventario', route: '/inventory', level: 10 },
    { title: 'LOTO Digital', route: '/loto', level: 10 },
    { title: 'Administración', route: '/admin', level: 999 }
  ];
  
  menuItems.forEach(item => {
    if (userLevel >= item.level) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + item.route;
      a.textContent = item.title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.route);
        toggleSidebar();
      });
      li.appendChild(a);
      menuList.appendChild(li);
    }
  });
}

function navigate(route) {
  // Router simple
  window.location.hash = route;
  
  switch (route) {
    case '/':
      renderHome();
      break;
    case '/scanner':
      renderScanner();
      break;
    case '/assets':
      renderAssets();
      break;
    case '/inventory':
      renderInventory();
      break;
    case '/loto':
      renderLOTO();
      break;
    case '/admin':
      renderAdmin();
      break;
    default:
      render404();
  }
}

window.CRGM.navigate = navigate;

function renderHome() {
  const user = window.CRGM.auth.getCurrentUser();
  const container = document.getElementById('view-container');
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h1 style="color: var(--color-success); margin-bottom: 1rem;">
        🏭 CRGM-API
      </h1>
      <p style="color: var(--color-text-dim);">
        Sistema Operativo Industrial
      </p>
      <p style="margin-top: 2rem;">
        Usuario: <strong>${user.name}</strong><br>
        Nivel: <strong>${user.level}</strong><br>
        Token: <code>${user.token}</code>
      </p>
      <div style="margin-top: 2rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
        <h3>🚀 Módulos Disponibles:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Base de Datos (IndexedDB)
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Sistema de Autenticación
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-success); margin-bottom: 0.5rem; background: var(--color-surface);">
            ✓ Gestor Modular
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-warning); margin-bottom: 0.5rem; background: var(--color-surface);">
            ⚠ Escáner QR (Pendiente)
          </li>
          <li style="padding: 0.5rem; border-left: 3px solid var(--color-warning); margin-bottom: 0.5rem; background: var(--color-surface);">
            ⚠ LOTO Digital (Pendiente)
          </li>
        </ul>
      </div>
    </div>
  `;
}

function renderScanner() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>📹 Escáner QR</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderAssets() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>🏭 Gestión de Activos</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderInventory() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>📦 Inventario</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderLOTO() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>🔒 LOTO Digital</h2>
      <p style="color: var(--color-warning);">Módulo en desarrollo...</p>
    </div>
  `;
}

function renderAdmin() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem;">
      <h2>⚙️ Administración</h2>
      <p style="color: var(--color-warning);">Panel de administración en desarrollo...</p>
    </div>
  `;
}

function render404() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="padding: 1rem; text-align: center;">
      <h2 style="color: var(--color-danger);">404</h2>
      <p>Página no encontrada</p>
    </div>
  `;
}

// ============================================
// UTILIDADES UI
// ============================================

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('hidden', !show);
}

function showError(message, container = null) {
  if (container) {
    container.textContent = message;
    container.classList.remove('hidden');
    setTimeout(() => container.classList.add('hidden'), 5000);
  } else {
    showToast(message, 'error');
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// ARRANCAR APLICACIÓN
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

## 3️⃣ INSTRUCCIONES DE IMPLEMENTACIÓN

### Paso 1: Crear Estructura
```bash
cd /home/crgm-unix/Desktop/CRGM-API
mkdir -p src/{css,js/{core,modules},assets/icons,lib}
```

### Paso 2: Copiar Archivos
Crear cada archivo con el contenido proporcionado arriba.

### Paso 3: Crear Iconos Temporales
```bash
# Descargar o crear iconos PNG de 192x192 y 512x512
# Por ahora, puedes usar iconos de prueba
```

### Paso 4: Iniciar Servidor Local
```bash
cd src
python3 -m http.server 8000
```

### Paso 5: Abrir en Navegador
Visita: `http://localhost:8000`

---

## 4️⃣ VERIFICACIÓN Y TESTING

### ✅ Checklist de Verificación

**Service Worker:**
```javascript
// En DevTools > Console
navigator.serviceWorker.getRegistrations().then(r => 
  console.log('SW Activo:', r.length > 0)
);
```

**IndexedDB:**
```javascript
// DevTools > Application > IndexedDB
// Debe existir: crgm_industrial_db
// Con stores: assets, logs, inventory, users, config
```

**Autenticación:**
1. Abrir la app
2. Ingresar token: `CRGM2026`
3. Debe mostrar: "Bienvenido, Administrador!"
4. Badge debe mostrar: "Administrador (Lv 999)"

**Offline Mode:**
1. Abrir app en navegador
2. Activar "Modo Avión" en DevTools (Network > Offline)
3. Recargar página
4. La app debe seguir funcionando

---

## 5️⃣ PRÓXIMOS PASOS

Una vez verificado que el núcleo funciona:

1. **Implementar Módulo Scanner** (`src/js/modules/scanner.js`)
2. **Implementar Módulo LOTO** (`src/js/modules/loto.js`)
3. **Implementar Módulo Assets** (`src/js/modules/assets.js`)
4. **Implementar Módulo Inventory** (`src/js/modules/inventory.js`)

Cada módulo debe seguir la plantilla en `MODULE_TEMPLATE.md`.

---

## 6️⃣ TROUBLESHOOTING

### Error: Service Worker no se registra
- Verificar que estés usando HTTPS o localhost
- Limpiar cache del navegador
- Verificar ruta del sw.js

### Error: IndexedDB no se crea
- Abrir DevTools > Console para ver errores
- Verificar compatibilidad del navegador
- Limpiar datos del sitio y recargar

### Error: CORS al cargar módulos
- Asegurarse de usar un servidor HTTP (no abrir archivo directamente)
- Usar `python3 -m http.server` o similar

---

## 🎯 RESULTADO ESPERADO

Al completar esta fase, tendrás:

✅ PWA instalable en dispositivos móviles  
✅ Funcionamiento 100% offline  
✅ Sistema de autenticación con tokens  
✅ Base de datos IndexedDB operativa  
✅ Sistema modular extensible  
✅ UI responsive modo oscuro industrial  

**Token por defecto:** `CRGM2026` (Nivel 999 - Token Rey)

---

**Creado**: 10 Febrero 2026  
**Fase**: 1 - MVP Core  
**Duración Estimada**: 1-2 días  
**CRGM Industrial Solutions**
