/**
 * Role-based access control middleware
 * @param  {...string} roles - allowed roles
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden',
        });
    }

    next();
};

export { requireRole };
