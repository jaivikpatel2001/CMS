const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    subjectCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    assignedTo: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        enrollmentNumber: {
            type: String,
            required: true
        }
    }],
    dueDate: {
        type: Date,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    instructions: {
        type: String,
        trim: true,
        maxlength: 500
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
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        enrollmentNumber: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        file: {
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
            }
        },
        status: {
            type: String,
            enum: ['submitted', 'graded', 'late'],
            default: 'submitted'
        },
        marks: {
            type: Number,
            min: 0
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: 500
        },
        gradedAt: {
            type: Date
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ facultyId: 1 });
assignmentSchema.index({ subjectId: 1 });
assignmentSchema.index({ subjectCode: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ 'assignedTo.studentId': 1 });

// Virtual for assignment status
assignmentSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status === 'active';
});

// Method to check if student has submitted
assignmentSchema.methods.hasStudentSubmitted = function(studentId) {
    return this.submissions.some(submission => 
        submission.studentId.toString() === studentId.toString()
    );
};

// Method to get assignment statistics
assignmentSchema.methods.getStatistics = function() {
    const totalAssigned = this.assignedTo.length;
    const totalSubmitted = this.submissions.length;
    const totalGraded = this.submissions.filter(sub => sub.status === 'graded').length;
    const submissionRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0;
    const gradingRate = totalSubmitted > 0 ? Math.round((totalGraded / totalSubmitted) * 100) : 0;

    return {
        totalAssigned,
        totalSubmitted,
        totalGraded,
        submissionRate,
        gradingRate,
        pendingGrading: totalSubmitted - totalGraded
    };
};

// Static method to get assignments by subject
assignmentSchema.statics.getAssignmentsBySubject = function(subjectId) {
    return this.find({ subjectId })
        .populate('facultyId', 'userId employeeId department')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ createdAt: -1 });
};

// Static method to get assignments by faculty and subject
assignmentSchema.statics.getAssignmentsByFacultyAndSubject = function(facultyId, subjectId) {
    return this.find({ facultyId, subjectId })
        .populate('subjectId', 'subjectCode subjectName semester year')
        .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Assignment', assignmentSchema);
