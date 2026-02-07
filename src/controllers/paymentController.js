import crypto from 'crypto';
import Payment from '../models/Payment.js';

const createPayment = async (req, res) => {
    try {
        const { amount, currency, purpose, metadata } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const reference = `PAY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

        const payment = await Payment.create({
            userId: req.user._id,
            reference,
            amount,
            currency: currency || 'USD',
            purpose: purpose || '',
            status: 'pending',
            metadata: metadata || {},
        });

        res.status(201).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating payment',
        });
    }
};

const paymentWebhook = async (req, res) => {
    try {
        const { reference, status } = req.body;
        const allowed = ['paid', 'failed', 'refunded'];
        if (!reference || !allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
        }

        const payment = await Payment.findOne({ reference });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        payment.status = status;
        await payment.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const requestRefund = async (req, res) => {
    try {
        const { reference } = req.body;
        if (!reference) {
            return res.status(400).json({ success: false, message: 'Reference is required' });
        }

        const payment = await Payment.findOne({ reference });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        payment.status = 'refunded';
        await payment.save();

        res.status(200).json({ success: true, message: 'Refund processed', payment });
    } catch (error) {
        console.error('Refund request error:', error);
        res.status(500).json({ success: false, message: 'Server error while refunding' });
    }
};

export { createPayment, paymentWebhook, requestRefund };
