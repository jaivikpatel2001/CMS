const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true,
        enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty']
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
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
            default: 3
        }
    }],
    classes: [{
        subjectCode: {
            type: String,
            required: true
        },
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
        }
    }],
    salary: {
        basic: {
            type: Number,
            required: true
        },
        allowances: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    joiningDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
facultySchema.index({ employeeId: 1 });
facultySchema.index({ userId: 1 });
facultySchema.index({ department: 1 });

// Virtual for full designation display
facultySchema.virtual('designationDisplay').get(function() {
    return `${this.designation} - ${this.department}`;
});

module.exports = mongoose.model('Faculty', facultySchema);
