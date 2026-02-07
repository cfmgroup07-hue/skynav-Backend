import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
    },
    { _id: false }
);

const pricingSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
    },
    { _id: false }
);

const visaRuleSchema = new mongoose.Schema(
    {
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VisaCountry',
            required: true,
        },
        type: {
            type: String,
            enum: ['tourist', 'business', 'marine'],
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        requirements: { type: [String], default: [] },
        documents: { type: [String], default: [] },
        processingTime: { type: String, default: '' },
        validity: { type: String, default: '' },
        entryType: { type: String, default: '' },
        maxStay: { type: String, default: '' },
        pricing: { type: pricingSchema, required: true },
        whyUs: { type: [String], default: [] },
        faqs: { type: [faqSchema], default: [] },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

visaRuleSchema.index({ country: 1, type: 1 }, { unique: true });

const VisaRule = mongoose.model('VisaRule', visaRuleSchema);

export default VisaRule;
