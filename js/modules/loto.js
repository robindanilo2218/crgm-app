const lotoManager = {
    toggleUI: () => {
        const ui = document.getElementById('view-loto');
        // Si está bloqueado (display block), NO dejar cerrar a menos que desbloquee
        if(localStorage.getItem('loto_lock')) {
            alert("⚠️ MÁQUINA BLOQUEADA. NO PUEDE SALIR.");
            return;
        }
        ui.style.display = ui.style.display === 'none' ? 'flex' : 'none';
    },

    lock: () => {
        const id = document.getElementById('loto-machine').value;
        const v = document.getElementById('check-volt').checked;
        const l = document.getElementById('check-lock').checked;

        if(!id || !v || !l) return alert("COMPLETE EL PROTOCOLO DE SEGURIDAD");

        localStorage.setItem('loto_lock', id);
        db.addLog('LOTO_LOCK', id);
        lotoManager.renderLocked(id);
    },

    unlock: () => {
        if(!confirm("¿CONFIRMA QUE ES SEGURO ENERGIZAR?")) return;
        localStorage.removeItem('loto_lock');
        db.addLog('LOTO_UNLOCK', 'Manual');
        location.reload(); // Resetear UI
    },

    renderLocked: (id) => {
        document.getElementById('view-loto').style.display = 'flex';
        document.querySelector('.loto-content h1').innerText = `🔒 BLOQUEADO: ${id}`;
        document.getElementById('btn-loto-lock').style.display = 'none';
        document.getElementById('btn-loto-unlock').style.display = 'block';
        document.querySelector('.checklist').style.display = 'none';
        document.getElementById('loto-machine').style.display = 'none';
    },

    checkActiveLock: () => {
        const active = localStorage.getItem('loto_lock');
        if(active) lotoManager.renderLocked(active);
    }
};

document.getElementById('btn-loto-lock').addEventListener('click', lotoManager.lock);
document.getElementById('btn-loto-unlock').addEventListener('click', lotoManager.unlock);