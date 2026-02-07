import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPayment, paymentWebhook, requestRefund } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', protect, createPayment);
router.post('/webhook', paymentWebhook);
router.post('/refunds/request', protect, requestRefund);

export default router;
