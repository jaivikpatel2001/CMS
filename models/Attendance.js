const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['present', 'absent', 'late', 'excused'],
        default: 'absent'
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: 200
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    markedAt: {
        type: Date,
        default: Date.now
    },
    classTime: {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },
    room: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ studentId: 1, subjectCode: 1 });
attendanceSchema.index({ enrollmentNumber: 1 });
attendanceSchema.index({ facultyId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ semester: 1, year: 1 });

// Compound index for unique attendance per student per subject per date
attendanceSchema.index({ 
    studentId: 1, 
    subjectCode: 1, 
    date: 1 
}, { unique: true });

// Static method to calculate attendance percentage
attendanceSchema.statics.calculateAttendancePercentage = async function(studentId, subjectCode, semester, year) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Last 6 months
    
    const attendanceRecords = await this.find({
        studentId,
        subjectCode,
        semester,
        year,
        date: { $gte: startDate }
    });
    
    if (attendanceRecords.length === 0) {
        return 0;
    }
    
    const presentCount = attendanceRecords.filter(record => 
        record.status === 'present' || record.status === 'late'
    ).length;
    
    const totalCount = attendanceRecords.length;
    
    return Math.round((presentCount / totalCount) * 100);
};

// Static method to get attendance summary
attendanceSchema.statics.getAttendanceSummary = async function(studentId, semester, year) {
    const summary = await this.aggregate([
        {
            $match: {
                studentId: new mongoose.Types.ObjectId(studentId),
                semester,
                year
            }
        },
        {
            $group: {
                _id: '$subjectCode',
                subjectName: { $first: '$subjectName' },
                totalClasses: { $sum: 1 },
                presentClasses: {
                    $sum: {
                        $cond: [
                            { $in: ['$status', ['present', 'late']] },
                            1,
                            0
                        ]
                    }
                },
                absentClasses: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'absent'] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $addFields: {
                attendancePercentage: {
                    $round: [
                        {
                            $multiply: [
                                { $divide: ['$presentClasses', '$totalClasses'] },
                                100
                            ]
                        },
                        2
                    ]
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
    
    return summary;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
