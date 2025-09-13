const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadsDir;
        
        // Create subdirectories based on file type
        if (file.fieldname === 'assignment') {
            uploadPath = path.join(uploadsDir, 'assignments');
        } else if (file.fieldname === 'document') {
            uploadPath = path.join(uploadsDir, 'documents');
        } else if (file.fieldname === 'profile') {
            uploadPath = path.join(uploadsDir, 'profiles');
        } else {
            uploadPath = path.join(uploadsDir, 'misc');
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    };

    const fileType = file.mimetype;
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check if file type is allowed
    if (allowedTypes[fileType] && allowedTypes[fileType].includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${fileType} is not allowed. Allowed types: PDF, Images, Word, Excel`), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 5 // Maximum 5 files per request
    }
});

// Specific upload configurations
const uploadAssignment = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(uploadsDir, 'assignments', req.user._id.toString());
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = 'assignment-' + uniqueSuffix + extension;
            cb(null, filename);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Only allow PDF files for assignments
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for assignments'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for assignments
        files: 1
    }
});

const uploadDocument = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(uploadsDir, 'documents');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = 'document-' + uniqueSuffix + extension;
            cb(null, filename);
        }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB for documents
        files: 3
    }
});

const uploadProfile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(uploadsDir, 'profiles');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = 'profile-' + req.user._id + '-' + uniqueSuffix + extension;
            cb(null, filename);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Only allow image files for profiles
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures'), false);
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for profile pictures
        files: 1
    }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum allowed size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum allowed is 5 files per request.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name in file upload.'
            });
        }
    }
    
    if (error.message.includes('File type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Utility function to delete file
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Utility function to get file info
const getFileInfo = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            return {
                exists: true,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        }
        return { exists: false };
    } catch (error) {
        console.error('Error getting file info:', error);
        return { exists: false };
    }
};

module.exports = {
    upload,
    uploadAssignment,
    uploadDocument,
    uploadProfile,
    handleUploadError,
    deleteFile,
    getFileInfo
};
