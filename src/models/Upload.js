import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        path: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const Upload = mongoose.model('Upload', uploadSchema);

export default Upload;
