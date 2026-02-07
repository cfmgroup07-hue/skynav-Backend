import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import visaRoutes from './routes/visaRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import configurePassport from './config/passport.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = process.env.FRONTEND_DIST_PATH
    ? path.resolve(process.env.FRONTEND_DIST_PATH)
    : path.resolve(__dirname, '../../Frontend/dist');

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`🚫 CORS blocked origin: ${origin}`);
            callback(null, true); // Temporarily allow all for debugging if frontend URL is tricky
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};


console.log('🛡️  CORS Configuration:');
console.log(`   - Origin: ${corsOptions.origin}`);
console.log(`   - FRONTEND_URL from env: ${process.env.FRONTEND_URL}`);

app.use(cors(corsOptions));


/**
 * Body Parser Middleware
 * Parse JSON and URL-encoded request bodies
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * HTTP Request Logger (only in development)
 */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/**
 * Session Configuration
 * Required for Passport OAuth flow
 */
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'skynav-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

/**
 * Initialize Passport and configure Google OAuth
 */
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// ==========================================
// ROUTES
// ==========================================

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Skynav Backend API is running',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Root Endpoint
 */
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Skynav Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/health',
        },
    });
});

/**
 * Authentication Routes
 */
app.use('/api/auth', authRoutes);

/**
 * Search History Routes
 */
app.use('/api/search', searchRoutes);

/**
 * Booking Routes
 */
app.use('/api/bookings', bookingRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Static uploads
 */
app.use('/uploads', express.static(path.resolve('uploads')));

/**
 * Serve Frontend (Production)
 */
if (process.env.NODE_ENV === 'production') {
    if (fs.existsSync(frontendDistPath)) {
        app.use(express.static(frontendDistPath));

        app.get(/^\/(?!api|health).*/, (req, res) => {
            res.sendFile(path.join(frontendDistPath, 'index.html'));
        });
    } else {
        console.warn(
            `⚠️  Frontend dist not found at ${frontendDistPath}. ` +
            'Set FRONTEND_DIST_PATH or build frontend before starting the server.'
        );
    }
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * 404 Handler - Route Not Found
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

export default app;
