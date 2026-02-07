import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    listVisas,
    getVisaByCountry,
    applyVisa,
    getVisaApplication,
    updateVisaApplicationStatus,
    listMyVisaApplications,
} from '../controllers/visaController.js';

const router = express.Router();

router.get('/list', listVisas);
router.post('/apply', protect, applyVisa);
router.get('/application/:id', protect, getVisaApplication);
router.get('/application/status/my', protect, listMyVisaApplications);
router.patch(
    '/application/status/:id',
    protect,
    requireRole('admin', 'superadmin'),
    updateVisaApplicationStatus
);
router.get('/:country', getVisaByCountry);

export default router;
