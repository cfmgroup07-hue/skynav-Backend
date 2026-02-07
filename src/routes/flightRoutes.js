import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    searchFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight,
} from '../controllers/flightController.js';

const router = express.Router();

router.get('/search', searchFlights);
router.get('/:id', getFlightById);
router.post('/create', protect, requireRole('admin', 'superadmin'), createFlight);
router.patch('/update/:id', protect, requireRole('admin', 'superadmin'), updateFlight);
router.delete('/delete/:id', protect, requireRole('admin', 'superadmin'), deleteFlight);

export default router;
