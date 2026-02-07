import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema(
    {
        airline: { type: String, required: true },
        flightNumber: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
        departureTime: { type: String, required: true },
        arrivalTime: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        seatsAvailable: { type: Number, default: 0 },
        baggage: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;
