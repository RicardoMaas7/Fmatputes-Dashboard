const express = require('express');
const router = express.Router();
const { getRadarStats, generateCustomRadar } = require('../controllers/statsController');
const { protectRoute } = require('../middlewares/authMiddleware');

router.get('/radar', protectRoute, getRadarStats);
// Si la función generateCustomRadar no está bien exportada en el controlador, la comentamos un segundo para probar:
if (generateCustomRadar) {
    router.post('/radar/custom', protectRoute, generateCustomRadar);
}

module.exports = router;