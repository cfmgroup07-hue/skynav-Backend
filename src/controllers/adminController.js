import User from '../models/User.js';
import Booking from '../models/Booking.js';
import VisaApplication from '../models/VisaApplication.js';
import VisaCountry from '../models/VisaCountry.js';
import VisaRule from '../models/VisaRule.js';
import Payment from '../models/Payment.js';
import Banner from '../models/Banner.js';
import CmsPage from '../models/CmsPage.js';
import Faq from '../models/Faq.js';

const listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching users' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (isBlocked !== undefined) user.isBlocked = isBlocked;
        if (role && ['user', 'admin', 'superadmin'].includes(role)) user.role = role;

        await user.save();
        res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user && req.user._id && req.user._id.toString() === id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting user' });
    }
};

const listBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ bookedAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('List bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
    }
};

const listVisaApplications = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const applications = await VisaApplication.find(query)
            .populate('country')
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error('List visa applications error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching applications' });
    }
};

const listVisaCountries = async (req, res) => {
    try {
        const countries = await VisaCountry.find().sort({ name: 1 });
        res.status(200).json({ success: true, countries });
    } catch (error) {
        console.error('List visa countries error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching countries' });
    }
};

const createVisaCountry = async (req, res) => {
    try {
        const country = await VisaCountry.create(req.body);
        res.status(201).json({ success: true, country });
    } catch (error) {
        console.error('Create visa country error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating country' });
    }
};

const updateVisaCountry = async (req, res) => {
    try {
        const country = await VisaCountry.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!country) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.status(200).json({ success: true, country });
    } catch (error) {
        console.error('Update visa country error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating country' });
    }
};

const deleteVisaCountry = async (req, res) => {
    try {
        const country = await VisaCountry.findByIdAndDelete(req.params.id);
        if (!country) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.status(200).json({ success: true, message: 'Country deleted' });
    } catch (error) {
        console.error('Delete visa country error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting country' });
    }
};

const upsertVisaRule = async (req, res) => {
    try {
        const { countryId, type } = req.body;
        const payload = { ...req.body, country: countryId };
        delete payload.countryId;
        const rule = await VisaRule.findOneAndUpdate(
            { country: countryId, type },
            payload,
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, rule });
    } catch (error) {
        console.error('Upsert visa rule error:', error);
        res.status(500).json({ success: false, message: 'Server error while saving rule' });
    }
};

const listPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error('List payments error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching payments' });
    }
};

const listBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error('List banners error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching banners' });
    }
};

const upsertBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = id
            ? await Banner.findByIdAndUpdate(id, req.body, { new: true })
            : await Banner.create(req.body);
        res.status(200).json({ success: true, banner });
    } catch (error) {
        console.error('Upsert banner error:', error);
        res.status(500).json({ success: false, message: 'Server error while saving banner' });
    }
};

const listPages = async (req, res) => {
    try {
        const pages = await CmsPage.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, pages });
    } catch (error) {
        console.error('List pages error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching pages' });
    }
};

const upsertPage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = id
            ? await CmsPage.findByIdAndUpdate(id, req.body, { new: true })
            : await CmsPage.create(req.body);
        res.status(200).json({ success: true, page });
    } catch (error) {
        console.error('Upsert page error:', error);
        res.status(500).json({ success: false, message: 'Server error while saving page' });
    }
};

const listFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, faqs });
    } catch (error) {
        console.error('List FAQs error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching FAQs' });
    }
};

const upsertFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = id
            ? await Faq.findByIdAndUpdate(id, req.body, { new: true })
            : await Faq.create(req.body);
        res.status(200).json({ success: true, faq });
    } catch (error) {
        console.error('Upsert FAQ error:', error);
        res.status(500).json({ success: false, message: 'Server error while saving FAQ' });
    }
};

const getReports = async (req, res) => {
    try {
        const bookings = await Booking.find();
        const payments = await Payment.find();
        const totalRevenue = payments
            .filter((p) => p.status === 'paid' || p.status === 'refunded')
            .reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({
            success: true,
            stats: {
                bookings: bookings.length,
                payments: payments.length,
                revenue: totalRevenue,
            },
        });
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching reports' });
    }
};

export {
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
};
