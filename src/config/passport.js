import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Configure Passport Google OAuth 2.0 Strategy
 * This handles the Google authentication flow
 */
const configurePassport = () => {
    // Only configure Google OAuth if credentials are provided
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Extract user information from Google profile
                        const email = profile.emails[0].value;
                        const googleId = profile.id;
                        const fullName = profile.displayName;
                        const profilePicture = profile.photos?.[0]?.value || null;

                        // Check if user already exists
                        let user = await User.findOne({
                            $or: [{ email }, { googleId }]
                        });

                        if (user) {
                            // User exists - update Google ID if not set
                            if (!user.googleId) {
                                user.googleId = googleId;
                                user.authProvider = 'google';
                                await user.save();
                            }

                            // Update profile picture if changed
                            if (user.profilePicture !== profilePicture) {
                                user.profilePicture = profilePicture;
                                await user.save();
                            }

                            return done(null, user);
                        } else {
                            // User doesn't exist - create new account (auto-registration)
                            user = await User.create({
                                fullName,
                                email,
                                googleId,
                                authProvider: 'google',
                                profilePicture,
                                password: null, // No password for Google users
                            });

                            console.log(`✅ New Google user registered: ${email}`);
                            return done(null, user);
                        }
                    } catch (error) {
                        console.error('Google OAuth error:', error);
                        return done(error, null);
                    }
                }
            )
        );

        console.log('✅ Google OAuth configured');
    } else {
        console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
        console.warn('   Email/password authentication will work, but Google login will be unavailable');
    }

    /**
     * Serialize user for session (not used with JWT, but required by Passport)
     */
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    /**
     * Deserialize user from session (not used with JWT, but required by Passport)
     */
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
