import mongoose from 'mongoose';

const uploadedDocSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
        fileName: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        size: { type: Number, default: 0 },
    },
    { _id: false }
);

const visaApplicationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        country: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaCountry', required: true },
        visaType: { type: String, enum: ['tourist', 'business', 'marine'], required: true },
        personal: {
            title: String,
            firstName: String,
            lastName: String,
            dateOfBirth: String,
            gender: String,
            nationality: String,
        },
        passport: {
            passportNumber: String,
            passportIssueDate: String,
            passportExpiryDate: String,
            passportIssueCountry: String,
        },
        contact: {
            email: String,
            phone: String,
            countryCode: String,
            address: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        marine: {
            cdcNumber: String,
            seamanBookNumber: String,
        },
        travel: {
            travelDate: String,
            returnDate: String,
            purposeOfVisit: String,
        },
        uploads: { type: [uploadedDocSchema], default: [] },
        status: {
            type: String,
            enum: ['pending', 'processing', 'approved', 'rejected'],
            default: 'pending',
        },
        remarks: { type: String, default: '' },
        paymentStatus: {
            type: String,
            enum: ['not_required', 'pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentRef: { type: String, default: '' },
    },
    { timestamps: true }
);

const VisaApplication = mongoose.model('VisaApplication', visaApplicationSchema);

export default VisaApplication;
