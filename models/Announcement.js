const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    author: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'faculty']
        }
    },
    targetAudience: {
        type: String,
        required: true,
        enum: ['all', 'students', 'faculty', 'admin', 'specific_department', 'specific_year'],
        default: 'all'
    },
    department: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['general', 'academic', 'exam', 'event', 'maintenance', 'emergency', 'other'],
        default: 'general'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    views: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Index for efficient queries
announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ department: 1 });
announcementSchema.index({ year: 1, semester: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ isPinned: 1 });

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
    return this.views.length;
});

// Virtual for is expired
announcementSchema.virtual('isExpired').get(function() {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
});

// Method to mark as viewed
announcementSchema.methods.markAsViewed = function(userId) {
    const existingView = this.views.find(view => 
        view.userId.toString() === userId.toString()
    );
    
    if (!existingView) {
        this.views.push({ userId });
        return this.save();
    }
    
    return Promise.resolve(this);
};

// Static method to get announcements for user
announcementSchema.statics.getAnnouncementsForUser = function(userRole, department = null, year = null, semester = null) {
    const query = {
        isActive: true,
        $or: [
            { targetAudience: 'all' },
            { targetAudience: userRole }
        ]
    };
    
    if (department) {
        query.$or.push({ department });
    }
    
    if (year && semester) {
        query.$or.push({ year, semester });
    }
    
    return this.find(query)
        .sort({ isPinned: -1, publishDate: -1 })
        .populate('author.userId', 'firstName lastName email');
};

// Pre-save middleware to set expiry date if not provided
announcementSchema.pre('save', function(next) {
    if (!this.expiryDate && this.priority === 'urgent') {
        // Urgent announcements expire after 7 days
        this.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (!this.expiryDate) {
        // Regular announcements expire after 30 days
        this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('Announcement', announcementSchema);
