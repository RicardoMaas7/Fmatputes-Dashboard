const { runPythonScript } = require('../services/pythonRunner');

const getRadarStats = async (req, res) => {
    try {
        // Invocamos el script y esperamos la respuesta
        const radarData = await runPythonScript('radar_stats.py');
        
        res.status(200).json(radarData);
    } catch (error) {
        console.error('[StatsController Error]', error);
        res.status(500).json({ 
            message: 'Error interno al procesar las estadísticas de radar.', 
            error: error.message 
        });
    }
};
const generateCustomRadar = async (req, res) => {
    try {
        // req.body tiene los datos del formulario (name, mathematics, etc.)
        // Convertimos el objeto JSON a un string para pasarlo por consola a Python
        const args = [JSON.stringify(req.body)];
        
        // Ejecutamos Python inyectando los argumentos
        const radarData = await runPythonScript('radar_stats.py', args);
        
        res.status(200).json(radarData);
    } catch (error) {
        console.error('[StatsController Error]', error);
        res.status(500).json({ 
            message: 'Error al generar el radar personalizado.', 
            error: error.message 
        });
    }
};

// No olvides exportarlo:
module.exports = { getRadarStats, generateCustomRadar };
