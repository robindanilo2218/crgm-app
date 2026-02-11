const backupManager = {
    exportData: async () => {
        // Simulación rápida de exportación
        const tx = db.db.transaction(['logs'], 'readonly');
        tx.objectStore('logs').getAll().onsuccess = (e) => {
            const data = JSON.stringify(e.target.result);
            const blob = new Blob([data], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CRGM_BACKUP_${Date.now()}.json`;
            a.click();
            app.log('Copia de seguridad física descargada.');
        };
    }
};