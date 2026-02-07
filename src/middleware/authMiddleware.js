import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes requiring authentication
 * Verifies JWT token and attaches user to request object
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found - token may be invalid',
                });
            }

            if (req.user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is blocked. Please contact support.',
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);

            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired - please login again',
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Not authorized - token verification failed',
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - no token provided',
        });
    }
};

export { protect };
