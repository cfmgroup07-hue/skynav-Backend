import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reference: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        purpose: { type: String, default: '' },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        metadata: { type: Object, default: {} },
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
