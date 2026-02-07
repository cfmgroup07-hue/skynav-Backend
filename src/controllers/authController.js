import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Register a new user (local authentication)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { fullName, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Create new user
        const user = await User.create({
            fullName,
            email,
            password,
            authProvider: 'local',
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data (without password) and token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message,
        });
    }
};

/**
 * @desc    Login user with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user and include password field for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if user registered with Google OAuth
        if (user.authProvider === 'google') {
            return res.status(400).json({
                success: false,
                message: 'This account uses Google login. Please sign in with Google.',
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account is blocked. Please contact support.',
            });
        }

        // Verify password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data (without password) and token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message,
        });
    }
};

/**
 * @desc    Handle Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public (via Passport)
 * @note    This is called by Passport after Google authentication
 */
const googleCallback = async (req, res) => {
    try {
        // User is attached to req by passport
        const user = req.user;

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        // Frontend will extract token from URL and store in localStorage
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private (requires JWT token)
 */
const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by protect middleware
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 * @note    Client should remove token from localStorage
 */
const logoutUser = async (req, res) => {
    try {
        // In JWT authentication, logout is handled client-side
        // by removing the token from storage
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
            error: error.message,
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { fullName, profilePicture } = req.body;

        // Get user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update fields if provided
        if (fullName) user.fullName = fullName;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: error.message,
        });
    }
};

/**
 * @desc    Change password (local users only)
 * @route   PATCH /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user uses local authentication
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: 'Password change is only available for local accounts. You signed up with Google.',
            });
        }

        // Verify current password
        const isPasswordMatch = await user.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password',
            error: error.message,
        });
    }
};

/**
 * @desc    Verify token and return user
 * @route   POST /api/auth/verify
 * @access  Private
 */
const verifyToken = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while verifying token',
        });
    }
};

/**
 * @desc    Request password reset (placeholder)
 * @route   POST /api/auth/reset
 * @access  Public
 */
const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link has been sent.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while requesting reset',
        });
    }
};

export {
    registerUser,
    loginUser,
    googleCallback,
    getCurrentUser,
    logoutUser,
    updateProfile,
    changePassword,
    verifyToken,
    resetPasswordRequest,
};
