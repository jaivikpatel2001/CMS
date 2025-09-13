const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
    examType: {
        type: String,
        required: true,
        enum: ['midterm', 'final', 'assignment', 'quiz', 'project', 'practical'],
        default: 'final'
    },
    marks: {
        obtained: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 1
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    grade: {
        type: String,
        required: true,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        uppercase: true
    },
    gpa: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: 200
    },
    examDate: {
        type: Date,
        required: true
    },
    resultDate: {
        type: Date,
        default: Date.now
    },
    isPassed: {
        type: Boolean,
        required: true,
        default: function() {
            return this.grade !== 'F';
        }
    },
    status: {
        type: String,
        enum: ['published', 'draft', 'under_review'],
        default: 'published'
    }
}, {
    timestamps: true
});

// Index for efficient queries
gradeSchema.index({ studentId: 1, subjectCode: 1 });
gradeSchema.index({ enrollmentNumber: 1 });
gradeSchema.index({ facultyId: 1 });
gradeSchema.index({ semester: 1, year: 1 });

// Compound index for unique grade per student per subject per exam
gradeSchema.index({ 
    studentId: 1, 
    subjectCode: 1, 
    examType: 1, 
    semester: 1, 
    year: 1 
}, { unique: true });

// Pre-save middleware to calculate percentage and GPA
gradeSchema.pre('save', function(next) {
    if (this.marks.total > 0) {
        this.marks.percentage = Math.round((this.marks.obtained / this.marks.total) * 100);
    }
    
    // Calculate GPA based on grade
    const gradeToGPA = {
        'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 
        'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    this.gpa = gradeToGPA[this.grade] || 0;
    
    next();
});

// Method to get grade letter based on percentage
gradeSchema.methods.calculateGrade = function() {
    const percentage = this.marks.percentage;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
};

module.exports = mongoose.model('Grade', gradeSchema);
