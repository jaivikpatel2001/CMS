const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 6,
        default: 3
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    prerequisites: [{
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
        }
    }],
    objectives: [{
        type: String,
        trim: true,
        maxlength: 200
    }],
    syllabus: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    evaluationCriteria: {
        midterm: {
            type: Number,
            min: 0,
            max: 100,
            default: 30
        },
        final: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },
        assignments: {
            type: Number,
            min: 0,
            max: 100,
            default: 10
        },
        attendance: {
            type: Number,
            min: 0,
            max: 100,
            default: 10
        }
    },
    classSchedule: [{
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        room: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['lecture', 'tutorial', 'practical', 'lab'],
            default: 'lecture'
        }
    }],
    enrolledStudents: [{
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
        enrolledAt: {
            type: Date,
            default: Date.now
        }
    }],
    maxStudents: {
        type: Number,
        default: 60,
        min: 1,
        max: 200
    },
    isActive: {
        type: Boolean,
        default: true
    },
    academicYear: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
subjectSchema.index({ subjectCode: 1 });
subjectSchema.index({ facultyId: 1 });
subjectSchema.index({ department: 1 });
subjectSchema.index({ semester: 1, year: 1 });
subjectSchema.index({ academicYear: 1 });
subjectSchema.index({ 'enrolledStudents.studentId': 1 });

// Compound index for unique subject per academic year
subjectSchema.index({ 
    subjectCode: 1, 
    academicYear: 1 
}, { unique: true });

// Virtual for enrollment count
subjectSchema.virtual('enrollmentCount').get(function() {
    return this.enrolledStudents.length;
});

// Virtual for available seats
subjectSchema.virtual('availableSeats').get(function() {
    return this.maxStudents - this.enrolledStudents.length;
});

// Virtual for enrollment percentage
subjectSchema.virtual('enrollmentPercentage').get(function() {
    return Math.round((this.enrolledStudents.length / this.maxStudents) * 100);
});

// Method to add student to subject
subjectSchema.methods.enrollStudent = function(studentId, enrollmentNumber) {
    // Check if student is already enrolled
    const existingEnrollment = this.enrolledStudents.find(
        enrollment => enrollment.studentId.toString() === studentId.toString()
    );
    
    if (existingEnrollment) {
        throw new Error('Student is already enrolled in this subject');
    }
    
    // Check if subject has available seats
    if (this.enrolledStudents.length >= this.maxStudents) {
        throw new Error('Subject is full, no available seats');
    }
    
    this.enrolledStudents.push({
        studentId,
        enrollmentNumber,
        enrolledAt: new Date()
    });
    
    return this.save();
};

// Method to remove student from subject
subjectSchema.methods.unenrollStudent = function(studentId) {
    const enrollmentIndex = this.enrolledStudents.findIndex(
        enrollment => enrollment.studentId.toString() === studentId.toString()
    );
    
    if (enrollmentIndex === -1) {
        throw new Error('Student is not enrolled in this subject');
    }
    
    this.enrolledStudents.splice(enrollmentIndex, 1);
    return this.save();
};

// Method to check if student is enrolled
subjectSchema.methods.isStudentEnrolled = function(studentId) {
    return this.enrolledStudents.some(
        enrollment => enrollment.studentId.toString() === studentId.toString()
    );
};

// Static method to get subjects by faculty
subjectSchema.statics.getSubjectsByFaculty = function(facultyId, academicYear) {
    const query = { facultyId };
    if (academicYear) {
        query.academicYear = academicYear;
    }
    
    return this.find(query)
        .populate('facultyId', 'userId employeeId department designation')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ semester: 1, subjectCode: 1 });
};

// Static method to get subjects by department
subjectSchema.statics.getSubjectsByDepartment = function(department, academicYear) {
    const query = { department };
    if (academicYear) {
        query.academicYear = academicYear;
    }
    
    return this.find(query)
        .populate('facultyId', 'userId employeeId department designation')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ semester: 1, subjectCode: 1 });
};

// Static method to get subjects by semester and year
subjectSchema.statics.getSubjectsBySemester = function(semester, year, academicYear) {
    const query = { semester, year };
    if (academicYear) {
        query.academicYear = academicYear;
    }
    
    return this.find(query)
        .populate('facultyId', 'userId employeeId department designation')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ subjectCode: 1 });
};

// Pre-save middleware to update updatedAt
subjectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Subject', subjectSchema);
