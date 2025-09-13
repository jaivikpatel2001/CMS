const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    complaintType: {
        type: String,
        required: true,
        enum: ['academics', 'infrastructure', 'faculty', 'administration', 'hostel', 'library', 'other'],
        default: 'other'
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    assignedTo: {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty'
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        }
    },
    resolution: {
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: {
            type: Date
        },
        actionTaken: {
            type: String,
            trim: true,
            maxlength: 300
        }
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
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 200
        },
        submittedAt: {
            type: Date
        }
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
complaintSchema.index({ studentId: 1 });
complaintSchema.index({ enrollmentNumber: 1 });
complaintSchema.index({ complaintType: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ submittedAt: -1 });
complaintSchema.index({ 'assignedTo.facultyId': 1 });
complaintSchema.index({ 'assignedTo.adminId': 1 });

// Virtual for complaint age
complaintSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.submittedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
complaintSchema.virtual('isOverdue').get(function() {
    const daysSinceSubmission = this.ageInDays;
    const priorityDays = {
        'urgent': 1,
        'high': 3,
        'medium': 7,
        'low': 14
    };
    return daysSinceSubmission > priorityDays[this.priority];
});

// Method to update status
complaintSchema.methods.updateStatus = function(newStatus, resolvedBy = null, resolution = null) {
    this.status = newStatus;
    
    if (newStatus === 'resolved' && resolvedBy) {
        this.resolution.resolvedBy = resolvedBy;
        this.resolution.resolvedAt = new Date();
        if (resolution) {
            this.resolution.description = resolution;
        }
    }
    
    return this.save();
};

// Static method to get complaint statistics
complaintSchema.statics.getComplaintStats = async function(startDate, endDate) {
    const stats = await this.aggregate([
        {
            $match: {
                submittedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    return stats;
};

module.exports = mongoose.model('Complaint', complaintSchema);
