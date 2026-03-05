const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        // En local la carpeta scripts está un nivel arriba del backend.
        // En Docker, configuraremos la ruta en el docker-compose.
        const basePath = process.env.PYTHON_SCRIPTS_PATH || path.resolve(__dirname, '../../../../scripts/python');
        const scriptPath = path.join(basePath, scriptName);

        // Invocamos a Python3
        const pythonProcess = spawn('python3', [scriptPath, ...args]);

        let dataString = '';
        let errorString = '';

        // Capturar salida exitosa
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        // Capturar errores
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        // Finalizar proceso
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[PythonRunner Error] Código ${code}:`, errorString);
                return reject(new Error(`El script de Python falló: ${errorString || 'Error desconocido'}`));
            }
            
            try {
                // Parseamos el texto que imprimió Python a un objeto JSON
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                console.error('[PythonRunner Error] No se pudo parsear el JSON:', dataString);
                reject(new Error('La respuesta del script de Python no es un JSON válido.'));
            }
        });
    });
};

module.exports = { runPythonScript };