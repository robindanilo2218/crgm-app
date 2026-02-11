/**
 * SYNC-MANAGER.JS
 * Módulo de Sincronización ("El Zas")
 * Maneja exportación/importación de datos para resiliencia offline
 */

class SyncManager {
    constructor(database) {
        this.db = database;
        this.version = '1.0.0';
    }

    /**
     * Exportar toda la base de datos a un archivo .crgm-pack
     * Este archivo puede moverse manualmente entre dispositivos
     */
    async exportAllData() {
        if (!this.db.db) {
            throw new Error('Base de datos no inicializada');
        }

        const exportPackage = {
            version: this.version,
            timestamp: Date.now(),
            device_id: this.getDeviceFingerprint(),
            data: {}
        };

        // Exportar cada "Object Store"
        const stores = ['assets', 'logs', 'deltas', 'diagrams', 'inventory', 'projects'];
        
        for (const storeName of stores) {
            try {
                const data = await this.getAllFromStore(storeName);
                exportPackage.data[storeName] = data;
                console.log(`✓ Exportado: ${storeName} (${data.length} registros)`);
            } catch (error) {
                console.warn(`⚠ Error exportando ${storeName}:`, error);
                exportPackage.data[storeName] = [];
            }
        }

        // Generar archivo para descarga
        const blob = new Blob([JSON.stringify(exportPackage, null, 2)], {
            type: 'application/json'
        });

        const filename = `crgm_backup_${Date.now()}.crgm-pack`;
        this.downloadBlob(blob, filename);

        return exportPackage;
    }

    /**
     * Importar datos desde un archivo .crgm-pack
     */
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const importPackage = JSON.parse(e.target.result);
                    
                    // Validar estructura
                    if (!importPackage.version || !importPackage.data) {
                        throw new Error('Archivo corrupto o inválido');
                    }

                    console.log(`Importando datos de dispositivo: ${importPackage.device_id}`);
                    console.log(`Fecha de backup: ${new Date(importPackage.timestamp).toLocaleString()}`);

                    let totalImported = 0;

                    // Importar cada store
                    for (const [storeName, records] of Object.entries(importPackage.data)) {
                        if (Array.isArray(records)) {
                            await this.importToStore(storeName, records);
                            totalImported += records.length;
                            console.log(`✓ Importado: ${storeName} (${records.length} registros)`);
                        }
                    }

                    resolve({
                        success: true,
                        totalRecords: totalImported,
                        timestamp: importPackage.timestamp
                    });

                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Obtener todos los registros de un store
     */
    getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db.db.objectStoreNames.contains(storeName)) {
                resolve([]);
                return;
            }

            const transaction = this.db.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Importar registros a un store (con merge inteligente)
     */
    async importToStore(storeName, records) {
        if (!this.db.db.objectStoreNames.contains(storeName) || !Array.isArray(records)) {
            return;
        }

        const transaction = this.db.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        for (const record of records) {
            try {
                // Usar 'put' en lugar de 'add' para permitir sobrescritura
                store.put(record);
            } catch (error) {
                console.warn(`Error importando registro en ${storeName}:`, error);
            }
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Generar "huella digital" del dispositivo
     */
    getDeviceFingerprint() {
        const nav = navigator;
        const screen = window.screen;
        
        const components = [
            nav.userAgent,
            nav.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ];

        // Hash simple
        let hash = 0;
        const str = components.join('|');
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'DEV_' + Math.abs(hash).toString(16).toUpperCase();
    }

    /**
     * Descargar blob como archivo
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Generar "Delta" (cambio pequeño) para sincronización P2P
     * Este es el archivo ligero que viaja entre dispositivos
     */
    createDelta(type, data) {
        const delta = {
            id: 'delta_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            device: this.getDeviceFingerprint(),
            type: type,
            payload: data,
            synced: false
        };

        // Guardar en el store de deltas
        if (this.db.db) {
            const tx = this.db.db.transaction(['deltas'], 'readwrite');
            const store = tx.objectStore('deltas');
            store.put({ ...delta, hash: delta.id });
        }

        return delta;
    }

    /**
     * Obtener deltas pendientes de sincronización
     */
    async getPendingDeltas() {
        const allDeltas = await this.getAllFromStore('deltas');
        return allDeltas.filter(d => !d.synced);
    }

    /**
     * Marcar delta como sincronizado
     */
    markDeltaSynced(deltaId) {
        if (!this.db.db) return;
        
        const tx = this.db.db.transaction(['deltas'], 'readwrite');
        const store = tx.objectStore('deltas');
        
        store.get(deltaId).onsuccess = (e) => {
            const delta = e.target.result;
            if (delta) {
                delta.synced = true;
                store.put(delta);
            }
        };
    }
}

// Exportar para uso en otros módulos
window.SyncManager = SyncManager;

// Export ES6 Module (para imports)
export default SyncManager;
