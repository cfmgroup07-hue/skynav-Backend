import mongoose from 'mongoose';

/**
 * Booking Schema
 * Stores user flight bookings
 */
const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        airline: {
            type: String,
            required: [true, 'Airline name is required'],
            trim: true,
        },
        flightNumber: {
            type: String,
            required: [true, 'Flight number is required'],
            trim: true,
        },
        from: {
            type: String,
            required: [true, 'Departure location is required'],
            trim: true,
        },
        to: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true,
        },
        departureDate: {
            type: Date,
            required: [true, 'Departure date is required'],
            index: true,
        },
        arrivalDate: {
            type: Date,
            default: null,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        passengers: {
            type: Number,
            default: 1,
            min: [1, 'At least 1 passenger required'],
        },
        bookingStatus: {
            type: String,
            enum: {
                values: ['confirmed', 'cancelled', 'completed'],
                message: '{VALUE} is not a valid booking status',
            },
            default: 'confirmed',
            index: true,
        },
        bookedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
bookingSchema.index({ userId: 1, departureDate: -1 });
bookingSchema.index({ userId: 1, bookingStatus: 1 });

/**
 * Virtual to determine if booking is upcoming or past
 */
bookingSchema.virtual('isUpcoming').get(function () {
    return this.departureDate > new Date() && this.bookingStatus === 'confirmed';
});

/**
 * Instance method to check if booking can be cancelled
 */
bookingSchema.methods.canBeCancelled = function () {
    // Can only cancel if confirmed and departure is in future
    return (
        this.bookingStatus === 'confirmed' &&
        this.departureDate > new Date()
    );
};

// Ensure virtuals are included in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
