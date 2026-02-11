const app = {
    init: async () => {
        // 1. Iniciar DB
        await db.init();
        
        // 2. Registrar SW (Offline)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => app.log('SW: Modo Offline Activo.'));
        }

        // 3. Chequeo de Batería
        if ('getBattery' in navigator) {
            navigator.getBattery().then(bat => {
                document.getElementById('bat-level').innerText = Math.round(bat.level * 100) + '%';
            });
        }

        // 4. Chequeo de LOTO persistente
        lotoManager.checkActiveLock();
        
        // 5. Estado de Red
        window.addEventListener('online', app.updateNet);
        window.addEventListener('offline', app.updateNet);
        app.updateNet();
    },

    log: (msg) => {
        const console = document.getElementById('system-log');
        console.innerHTML += `> ${msg}<br>`;
        console.scrollTop = console.scrollHeight;
    },

    updateNet: () => {
        const dot = document.getElementById('net-dot');
        const txt = document.getElementById('net-text');
        if (navigator.onLine) {
            dot.className = 'dot active';
            txt.innerText = "CLOUD";
        } else {
            dot.className = 'dot offline';
            txt.innerText = "LOCAL P2P";
        }
    },

    switchView: (viewName) => {
        // Ocultar todos
        document.querySelectorAll('.viewport').forEach(el => el.style.display = 'none');
        // Detener cámara si salimos
        if (viewName !== 'scanner') scanner.stop();
        
        // Mostrar seleccionado
        if (viewName === 'scanner') {
            document.getElementById('view-scanner').style.display = 'flex';
        } else if (viewName === 'diagram') {
            document.getElementById('view-diagram').style.display = 'flex';
        }
    }
};

// Iniciar al cargar
window.onload = app.init;