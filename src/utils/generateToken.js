import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authenticated users
 * @param {string} userId - MongoDB user ID
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        }
    );
};

export default generateToken;
