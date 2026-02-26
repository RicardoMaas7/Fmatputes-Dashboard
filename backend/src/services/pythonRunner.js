const { spawn } = require('child_process');
const path = require('path');

/**
 * Ejecuta un script de Python y retorna el resultado parseado como JSON
 * @param {string} scriptName - Nombre del script (ej: 'radar_stats.py')
 * @param {Array} args - Argumentos opcionales para pasar al script
 * @returns {Promise<Object>} - Resultado del script como objeto JSON
 */
const runPythonScript = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        // Ruta relativa desde services/ hacia scripts/python/
        const scriptPath = path.join(__dirname, '../../../scripts/python', scriptName);
        
        // Intentamos con python3, si falla usamos python
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        
        const pythonProcess = spawn(pythonCmd, [scriptPath, ...args]);
        
        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('[PythonRunner] Error:', stderr);
                reject(new Error(stderr || 'Python script exited with code ' + code));
                return;
            }
            
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (parseError) {
                console.error('[PythonRunner] Parse error:', parseError.message);
                reject(new Error('Failed to parse Python output: ' + stdout));
            }
        });

        pythonProcess.on('error', (error) => {
            console.error('[PythonRunner] Spawn error:', error.message);
            reject(error);
        });
    });
};

module.exports = { runPythonScript };
