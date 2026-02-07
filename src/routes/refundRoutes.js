import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requestRefund } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/request', protect, requestRefund);

export default router;
