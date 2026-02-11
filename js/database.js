class IndustrialDB {
    constructor() {
        this.dbName = 'crgm_industrial_db';
        this.version = 2;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Almacenes de datos
                if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('logs')) db.createObjectStore('logs', { keyPath: 'timestamp' });
                if (!db.objectStoreNames.contains('diagrams')) db.createObjectStore('diagrams', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('inventory')) db.createObjectStore('inventory', { keyPath: 'id' });
                console.log('> DB: Estructura Actualizada.');
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                app.log('> DB: Conectada.');
                resolve(this.db);
            };
            request.onerror = (e) => reject(e);
        });
    }

    addLog(type, msg) {
        if (!this.db) return;
        const tx = this.db.transaction(['logs'], 'readwrite');
        tx.objectStore('logs').add({
            timestamp: Date.now(),
            type: type,
            details: msg,
            user: 'TOKEN_REY'
        });
    }
}
const db = new IndustrialDB();