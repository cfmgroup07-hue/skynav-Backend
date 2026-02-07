import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
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

        const {
            airline,
            flightNumber,
            from,
            to,
            departureDate,
            arrivalDate,
            price,
            currency,
            passengers,
        } = req.body;

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            airline,
            flightNumber,
            from,
            to,
            departureDate,
            arrivalDate: arrivalDate || null,
            price,
            currency: currency || 'USD',
            passengers: passengers || 1,
            bookingStatus: 'confirmed',
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                _id: booking._id,
                airline: booking.airline,
                flightNumber: booking.flightNumber,
                from: booking.from,
                to: booking.to,
                departureDate: booking.departureDate,
                arrivalDate: booking.arrivalDate,
                price: booking.price,
                currency: booking.currency,
                passengers: booking.passengers,
                bookingStatus: booking.bookingStatus,
                bookedAt: booking.bookedAt,
            },
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking',
            error: error.message,
        });
    }
};

/**
 * @desc    Get user's bookings with filters
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res) => {
    try {
        const { status, type } = req.query;
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // Build query
        const query = { userId: req.user._id };

        // Filter by status if provided
        if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
            query.bookingStatus = status;
        }

        // Filter by type (upcoming/past)
        if (type === 'upcoming') {
            query.departureDate = { $gte: new Date() };
            query.bookingStatus = 'confirmed';
        } else if (type === 'past') {
            query.departureDate = { $lt: new Date() };
        }

        // Get bookings
        const bookings = await Booking.find(query)
            .sort({ departureDate: -1 })
            .limit(limit)
            .skip(skip)
            .select('-__v');

        // Get total count
        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            bookings,
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).select('-__v');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Ensure user owns this booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
        }

        res.status(200).json({
            success: true,
            booking,
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking',
            error: error.message,
        });
    }
};

/**
 * @desc    Cancel a booking
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Ensure user owns this booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking',
            });
        }

        // Check if booking can be cancelled
        if (!booking.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled (either already cancelled or flight has departed)',
            });
        }

        // Update booking status
        booking.bookingStatus = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: {
                _id: booking._id,
                bookingStatus: booking.bookingStatus,
                airline: booking.airline,
                flightNumber: booking.flightNumber,
                from: booking.from,
                to: booking.to,
                departureDate: booking.departureDate,
            },
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking',
            error: error.message,
        });
    }
};

/**
 * @desc    Get bookings by user ID (admin)
 * @route   GET /api/bookings/user/:userId
 * @access  Private (admin)
 */
const getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .sort({ departureDate: -1 })
            .select('-__v');
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('Get bookings by user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user bookings',
        });
    }
};

export { createBooking, getMyBookings, getBookingById, cancelBooking, getBookingsByUser };
