import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
    listUsers,
    updateUserStatus,
    deleteUser,
    listBookings,
    listVisaApplications,
    listVisaCountries,
    createVisaCountry,
    updateVisaCountry,
    deleteVisaCountry,
    upsertVisaRule,
    listPayments,
    listBanners,
    upsertBanner,
    listPages,
    upsertPage,
    listFaqs,
    upsertFaq,
    getReports,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, requireRole('admin', 'superadmin'));

router.get('/users', listUsers);
router.patch('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/bookings', listBookings);
router.get('/visa-applications', listVisaApplications);

router.get('/visa-countries', listVisaCountries);
router.post('/visa-countries', createVisaCountry);
router.patch('/visa-countries/:id', updateVisaCountry);
router.delete('/visa-countries/:id', deleteVisaCountry);
router.post('/visa-rules', upsertVisaRule);

router.get('/payments', listPayments);

router.get('/cms/banners', listBanners);
router.post('/cms/banners', upsertBanner);
router.patch('/cms/banners/:id', upsertBanner);

router.get('/cms/pages', listPages);
router.post('/cms/pages', upsertPage);
router.patch('/cms/pages/:id', upsertPage);

router.get('/cms/faqs', listFaqs);
router.post('/cms/faqs', upsertFaq);
router.patch('/cms/faqs/:id', upsertFaq);

router.get('/reports', getReports);

export default router;
