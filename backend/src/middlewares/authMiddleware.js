const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    try {
        // Formato esperado: "Bearer <token>"
        const tokenParts = token.split(' ');
        const finalToken = tokenParts.length === 2 ? tokenParts[1] : token;

        const secret = process.env.JWT_SECRET || 'fmaputes_super_secret_key_2026';
        const decoded = jwt.verify(finalToken, secret);
        
        req.user = decoded; // Inyectamos los datos del usuario en la request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = { protectRoute, verifyToken: protectRoute };