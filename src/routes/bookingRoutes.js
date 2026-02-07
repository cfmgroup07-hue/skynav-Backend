import express from 'express';
import { body } from 'express-validator';
import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getBookingsByUser,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * Validation middleware for creating booking
 */
const createBookingValidation = [
    body('airline')
        .trim()
        .notEmpty()
        .withMessage('Airline is required'),
    body('flightNumber')
        .trim()
        .notEmpty()
        .withMessage('Flight number is required'),
    body('from')
        .trim()
        .notEmpty()
        .withMessage('Departure location is required'),
    body('to')
        .trim()
        .notEmpty()
        .withMessage('Destination is required'),
    body('departureDate')
        .notEmpty()
        .withMessage('Departure date is required')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('arrivalDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid arrival date format'),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be 3 characters'),
    body('passengers')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Passengers must be at least 1'),
];

// ==========================================
// ALL ROUTES ARE PROTECTED
// ==========================================

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', protect, createBookingValidation, createBooking);

/**
 * @route   GET /api/bookings/my
 * @desc    Get user's bookings
 * @access  Private
 * @query   status (confirmed/cancelled/completed), type (upcoming/past), 
 *          limit (default: 50), page (default: 1)
 */
router.get('/my', protect, getMyBookings);

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Get bookings by user ID (admin)
 * @access  Private (admin)
 */
router.get('/user/:userId', protect, requireRole('admin', 'superadmin'), getBookingsByUser);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
router.get('/:id', protect, getBookingById);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
