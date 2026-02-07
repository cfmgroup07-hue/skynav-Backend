import fs from 'fs';
import Upload from '../models/Upload.js';

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const upload = await Upload.create({
            originalName: req.file.originalname,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user?._id,
        });

        res.status(201).json({
            success: true,
            file: {
                id: upload._id,
                originalName: upload.originalName,
                fileName: upload.fileName,
                mimeType: upload.mimeType,
                size: upload.size,
                url: `/uploads/${upload.fileName}`,
            },
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading file',
        });
    }
};

const getFileMeta = async (req, res) => {
    try {
        const file = await Upload.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        res.status(200).json({
            success: true,
            file: {
                id: file._id,
                originalName: file.originalName,
                fileName: file.fileName,
                mimeType: file.mimeType,
                size: file.size,
                url: `/uploads/${file.fileName}`,
            },
        });
    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching file',
        });
    }
};

const deleteFile = async (req, res) => {
    try {
        const file = await Upload.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await Upload.deleteOne({ _id: file._id });

        res.status(200).json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting file',
        });
    }
};

export { uploadFile, getFileMeta, deleteFile };
