const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        const basePath = process.env.PYTHON_SCRIPTS_PATH || path.resolve(__dirname, '../../scripts/python');
        const scriptPath = path.join(basePath, scriptName);

        const pythonProcess = spawn('python3', [scriptPath, ...args]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('[PythonRunner Error]', errorString);
                return reject(new Error(errorString || 'Python script failed with code ' + code));
            }
            try {
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                console.error('[PythonRunner Error] Invalid JSON:', dataString.substring(0, 200));
                reject(new Error('Python script output is not valid JSON.'));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(error);
        });
    });
};

module.exports = { runPythonScript };
