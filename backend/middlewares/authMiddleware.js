const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non autorisé: Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Object contenant { id, email, role } (défini lors du login)
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Non autorisé: Token expiré ou invalide' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès interdit: Rôle insuffisant' });
        }
        next();
    }
}

module.exports = {
    requireAuth,
    requireRole
};
