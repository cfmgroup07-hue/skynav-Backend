import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Faq = mongoose.model('Faq', faqSchema);

export default Faq;
