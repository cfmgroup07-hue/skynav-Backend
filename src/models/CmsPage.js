import mongoose from 'mongoose';

const cmsPageSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        content: { type: String, default: '' },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const CmsPage = mongoose.model('CmsPage', cmsPageSchema);

export default CmsPage;
