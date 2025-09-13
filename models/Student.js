const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    program: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    subjects: [{
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
            ref: 'Faculty'
        },
        credits: {
            type: Number,
            default: 3
        }
    }],
    fees: {
        semesterFees: {
            type: Number,
            default: 20000
        },
        status: {
            type: String,
            enum: ['paid', 'pending', 'overdue'],
            default: 'pending'
        },
        lastPaymentDate: {
            type: Date
        },
        nextPaymentDue: {
            type: Date
        }
    },
    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        }
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ department: 1, year: 1, semester: 1 });

// Virtual for full enrollment display
studentSchema.virtual('enrollmentDisplay').get(function() {
    return `${this.enrollmentNumber} - ${this.program} (Year ${this.year}, Semester ${this.semester})`;
});

module.exports = mongoose.model('Student', studentSchema);
