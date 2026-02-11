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
    // Verificar que la DB esté lista
    _ensureDB() {
      if (!DatabaseManager.state.db || !DatabaseManager.state.initialized) {
        throw new Error('Base de datos no inicializada. Recarga la aplicación.');
      }
    },

    // Obtener un registro por ID
    async get(storeName, id) {
      this._ensureDB();
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.get(id);
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } catch (error) {
          console.error(`[DB] Error en get(${storeName}, ${id}):`, error);
          reject(error);
        }
      });
    },
    
    // Obtener todos los registros
    async getAll(storeName) {
      this._ensureDB();
      const db = DatabaseManager.state.db;
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.getAll();
          
          request.onsuccess = () => {
            console.log(`[DB] getAll(${storeName}): ${request.result.length} registros`);
            resolve(request.result);
          };
          request.onerror = () => {
            console.error(`[DB] Error en getAll(${storeName}):`, request.error);
            reject(request.error);
          };
        } catch (error) {
          console.error(`[DB] Error en getAll(${storeName}):`, error);
          reject(error);
        }
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
