import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import {
    registerUser,
    loginUser,
    googleCallback,
    getCurrentUser,
    logoutUser,
    updateProfile,
    changePassword,
    verifyToken,
    resetPasswordRequest,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Validation middleware for registration
 */
const registerValidation = [
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation middleware for login
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post('/register', registerValidation, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', loginValidation, loginUser);

/**
 * @route   POST /api/auth/reset
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset', resetPasswordRequest);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback URL
 * @access  Public (handled by Passport)
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        session: false, // We're using JWT, not sessions
    }),
    googleCallback
);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify token and return user
 * @access  Private
 */
router.post('/verify', protect, verifyToken);

/**
 * Validation middleware for profile update
 */
const updateProfileValidation = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('profilePicture')
        .optional()
        .isURL()
        .withMessage('Profile picture must be a valid URL'),
];

/**
 * Validation middleware for password change
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
];

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', protect, updateProfileValidation, updateProfile);

/**
 * @route   PATCH /api/auth/password
 * @desc    Change password (local users only)
 * @access  Private
 */
router.patch('/password', protect, changePasswordValidation, changePassword);

export default router;
