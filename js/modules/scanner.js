const scanner = {
    instance: null,
    start: () => {
        app.log('Iniciando sensores de visión...');
        scanner.instance = new Html5Qrcode("reader");
        scanner.instance.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                // Éxito
                navigator.vibrate(200);
                app.log(`DETECTADO: ${decodedText}`);
                document.getElementById('scan-result').style.display = 'block';
                document.getElementById('scan-result').innerText = decodedText;
                
                // Guardar en DB
                db.addLog('SCAN', decodedText);
                
                scanner.stop();
            },
            () => {} // Ignorar errores de frame
        );
    },
    stop: () => {
        if(scanner.instance) {
            scanner.instance.stop().then(() => scanner.instance.clear());
        }
    }
};

document.getElementById('btn-scan-action').addEventListener('click', scanner.start);