// Connection fix applied
import './src/config/env.js';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import seedSuperAdmin from './src/utils/seedSuperAdmin.js';
import seedVisaData from './src/utils/seedVisaData.js';


// ==========================================
// CONFIGURATION
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// DATABASE CONNECTION
// ==========================================

await connectDB();
await seedSuperAdmin();
await seedVisaData();

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ====================================');
    console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`✅ Server listening on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log('🚀 ====================================');
    console.log('');
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    console.log('⚠️  Shutting down server due to unhandled rejection...');

    server.close(() => {
        process.exit(1);
    });
});

/**
 * Handle SIGTERM signal (graceful shutdown)
 */
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received. Shutting down gracefully...');

    server.close(() => {
        console.log('✅ Server closed. Process terminated.');
        process.exit(0);
    });
});

/**
 * Handle SIGINT signal (Ctrl+C)
 */
process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received. Shutting down gracefully...');

    server.close(() => {
        console.log('✅ Server closed. Process terminated.');
        process.exit(0);
    });
});