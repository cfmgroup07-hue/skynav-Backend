import VisaCountry from '../models/VisaCountry.js';
import VisaRule from '../models/VisaRule.js';
import VisaApplication from '../models/VisaApplication.js';

const listVisas = async (req, res) => {
    try {
        const type = req.query.type || 'tourist';

        const countries = await VisaCountry.find({ isActive: true }).sort({ name: 1 });
        const countryIds = countries.map((c) => c._id);
        const rules = await VisaRule.find({
            country: { $in: countryIds },
            type,
            isActive: true,
        });

        const rulesByCountry = new Map(rules.map((r) => [r.country.toString(), r]));

        const data = countries.map((country) => ({
            _id: country._id,
            name: country.name,
            slug: country.slug,
            region: country.region,
            code: country.code,
            imageUrl: country.imageUrl,
            rule: rulesByCountry.get(country._id.toString()) || null,
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('List visas error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching visas',
        });
    }
};

const getVisaByCountry = async (req, res) => {
    try {
        const type = req.query.type || 'tourist';
        const { country } = req.params;

        const visaCountry = await VisaCountry.findOne({
            $or: [{ slug: country }, { code: country.toUpperCase() }],
        });

        if (!visaCountry) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }

        const rule = await VisaRule.findOne({
            country: visaCountry._id,
            type,
            isActive: true,
        });

        res.status(200).json({
            success: true,
            data: {
                country: visaCountry,
                rule,
            },
        });
    } catch (error) {
        console.error('Get visa error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching visa',
        });
    }
};

const applyVisa = async (req, res) => {
    try {
        const {
            countrySlug,
            visaType,
            personal,
            passport,
            contact,
            marine,
            travel,
            uploads,
        } = req.body;

        const visaCountry = await VisaCountry.findOne({ slug: countrySlug });
        if (!visaCountry) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }

        const rule = await VisaRule.findOne({
            country: visaCountry._id,
            type: visaType,
            isActive: true,
        });

        const paymentStatus =
            rule && rule.pricing && rule.pricing.amount > 0 ? 'pending' : 'not_required';

        const application = await VisaApplication.create({
            userId: req.user._id,
            country: visaCountry._id,
            visaType,
            personal,
            passport,
            contact,
            marine,
            travel,
            uploads: uploads || [],
            paymentStatus,
        });

        res.status(201).json({
            success: true,
            message: 'Visa application submitted',
            application,
        });
    } catch (error) {
        console.error('Apply visa error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting visa application',
        });
    }
};

const getVisaApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await VisaApplication.findById(id)
            .populate('country')
            .select('-__v');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (
            application.userId.toString() !== req.user._id.toString() &&
            !['admin', 'superadmin'].includes(req.user.role)
        ) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, application });
    } catch (error) {
        console.error('Get visa application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching application',
        });
    }
};

const updateVisaApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;

        const allowed = ['pending', 'processing', 'approved', 'rejected'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const application = await VisaApplication.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = status;
        if (remarks !== undefined) {
            application.remarks = remarks;
        }

        await application.save();

        res.status(200).json({
            success: true,
            message: 'Application updated',
            application,
        });
    } catch (error) {
        console.error('Update visa application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating application',
        });
    }
};

const listMyVisaApplications = async (req, res) => {
    try {
        const applications = await VisaApplication.find({ userId: req.user._id })
            .populate('country')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error('List visa applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applications',
        });
    }
};

export {
    listVisas,
    getVisaByCountry,
    applyVisa,
    getVisaApplication,
    updateVisaApplicationStatus,
    listMyVisaApplications,
};
