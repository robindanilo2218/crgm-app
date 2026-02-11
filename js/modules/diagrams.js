const diagramEditor = {
    svg: document.getElementById('drawing-board'),
    layer: document.getElementById('layer-draw'),
    isDrawing: false,
    
    init: () => {
        const s = diagramEditor.svg;
        s.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = s.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if(!diagramEditor.isDrawing) {
                // Nuevo path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${x} ${y}`);
                path.setAttribute('stroke', '#00FF41');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                diagramEditor.layer.appendChild(path);
                diagramEditor.isDrawing = true;
            } else {
                // Continuar path
                const path = diagramEditor.layer.lastChild;
                const d = path.getAttribute('d');
                path.setAttribute('d', `${d} L ${x} ${y}`);
            }
        });

        s.addEventListener('touchend', () => diagramEditor.isDrawing = false);
    },

    save: () => {
        const data = diagramEditor.layer.innerHTML;
        const tx = db.db.transaction(['diagrams'], 'readwrite');
        tx.objectStore('diagrams').put({ id: 'current', data: data });
        app.log('Plano guardado en memoria.');
    },

    load: () => {
        const tx = db.db.transaction(['diagrams'], 'readonly');
        tx.objectStore('diagrams').get('current').onsuccess = (e) => {
            if(e.target.result) diagramEditor.layer.innerHTML = e.target.result.data;
        };
    },

    clear: () => diagramEditor.layer.innerHTML = ''
};

diagramEditor.init();