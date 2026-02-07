import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema Definition
 * Supports both local (email/password) and Google OAuth authentication
 */
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please provide your full name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            // Password is required for local auth, but null for Google auth
            required: function () {
                return this.authProvider === 'local';
            },
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false, // Don't return password by default in queries
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
            required: true,
        },
        googleId: {
            type: String,
            sparse: true, // Allows multiple null values (for non-Google users)
            // Removed direct unique: true here as it's causing conflict warnings
        },

        profilePicture: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

/**
 * Pre-save middleware to hash password
 * Only runs when password is modified or new
 * Only for local authentication users
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Only hash if password exists (for local auth users)
    if (this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }

    next();
});

/**
 * Instance method to compare passwords during login
 * @param {string} enteredPassword - The password entered by user
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password) {
        return false; // Google users don't have passwords
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance method to get user data without sensitive information
 * @returns {Object} - User object without password
 */
userSchema.methods.toSafeObject = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);


export default User;
