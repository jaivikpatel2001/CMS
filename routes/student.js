const express = require('express');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const { authenticateToken, authorizeRole, validateRequest, asyncHandler } = require('../middleware/auth');
const { uploadAssignment, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeRole('student'));

// Get student profile
router.get('/profile', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id })
        .populate('userId', 'firstName lastName email phone');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    res.json({
        success: true,
        student
    });
}));

// Get student grades
router.get('/grades', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const grades = await Grade.find({
        studentId: student._id,
        status: 'published'
    }).populate('facultyId', 'userId')
    .populate('facultyId.userId', 'firstName lastName')
    .sort({ semester: 1, year: 1, examDate: -1 });

    // Calculate overall statistics
    const stats = await Grade.aggregate([
        {
            $match: {
                studentId: student._id,
                status: 'published'
            }
        },
        {
            $group: {
                _id: null,
                totalSubjects: { $sum: 1 },
                averagePercentage: { $avg: '$marks.percentage' },
                averageGPA: { $avg: '$gpa' },
                passedSubjects: {
                    $sum: { $cond: ['$isPassed', 1, 0] }
                }
            }
        }
    ]);

    res.json({
        success: true,
        grades,
        statistics: stats[0] || {
            totalSubjects: 0,
            averagePercentage: 0,
            averageGPA: 0,
            passedSubjects: 0
        }
    });
}));

// Get student attendance
router.get('/attendance', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const { semester, year } = req.query;
    
    let query = { studentId: student._id };
    if (semester && year) {
        query.semester = parseInt(semester);
        query.year = parseInt(year);
    }

    const attendance = await Attendance.find(query)
        .populate('facultyId', 'userId')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ date: -1 });

    // Get attendance summary
    const summary = await Attendance.getAttendanceSummary(student._id, 
        semester || student.semester, 
        year || student.year
    );

    res.json({
        success: true,
        attendance,
        summary
    });
}));

// Get student assignments
router.get('/assignments', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const assignments = await Assignment.find({
        'assignedTo.studentId': student._id,
        status: 'active'
    }).populate('facultyId', 'userId')
    .populate('facultyId.userId', 'firstName lastName')
    .sort({ dueDate: 1 });

    // Add submission status for each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
        const submission = assignment.submissions.find(sub => 
            sub.studentId.toString() === student._id.toString()
        );
        
        return {
            ...assignment.toObject(),
            submissionStatus: submission ? submission.status : 'not_submitted',
            submittedAt: submission ? submission.submittedAt : null,
            marks: submission ? submission.marks : null,
            feedback: submission ? submission.feedback : null
        };
    });

    res.json({
        success: true,
        assignments: assignmentsWithStatus
    });
}));

// Submit assignment
router.post('/assignments/submit', uploadAssignment.single('assignment'), handleUploadError, 
    validateRequest({
        assignmentId: { required: true }
    }), asyncHandler(async (req, res) => {
    const { assignmentId } = req.body;
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Assignment file is required'
        });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({
            success: false,
            message: 'Assignment not found'
        });
    }

    // Check if assignment is assigned to this student
    const isAssigned = assignment.assignedTo.some(assigned => 
        assigned.studentId.toString() === student._id.toString()
    );

    if (!isAssigned) {
        return res.status(403).json({
            success: false,
            message: 'You are not assigned to this assignment'
        });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(sub => 
        sub.studentId.toString() === student._id.toString()
    );

    if (existingSubmission) {
        return res.status(400).json({
            success: false,
            message: 'Assignment already submitted'
        });
    }

    // Check if due date has passed
    const isLate = new Date() > assignment.dueDate;
    const status = isLate ? 'late' : 'submitted';

    // Add submission
    assignment.submissions.push({
        studentId: student._id,
        enrollmentNumber: student.enrollmentNumber,
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size
        },
        status: status
    });

    await assignment.save();

    res.json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: {
            status: status,
            submittedAt: new Date(),
            isLate: isLate
        }
    });
}));

// Submit complaint
router.post('/complaints', validateRequest({
    complaintType: { required: true, enum: ['academics', 'infrastructure', 'faculty', 'administration', 'hostel', 'library', 'other'] },
    subject: { required: true, minLength: 5, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 500 },
    priority: { enum: ['low', 'medium', 'high', 'urgent'] }
}), asyncHandler(async (req, res) => {
    const { complaintType, subject, description, priority = 'medium' } = req.body;
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const complaint = new Complaint({
        studentId: student._id,
        enrollmentNumber: student.enrollmentNumber,
        studentName: `${req.user.firstName} ${req.user.lastName}`,
        department: student.department,
        complaintType,
        subject,
        description,
        priority
    });

    await complaint.save();

    res.json({
        success: true,
        message: 'Complaint submitted successfully',
        complaint: {
            id: complaint._id,
            complaintType: complaint.complaintType,
            subject: complaint.subject,
            status: complaint.status,
            submittedAt: complaint.submittedAt
        }
    });
}));

// Get student complaints
router.get('/complaints', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const complaints = await Complaint.find({ studentId: student._id })
        .sort({ submittedAt: -1 });

    res.json({
        success: true,
        complaints
    });
}));

// Get announcements for student
router.get('/announcements', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const announcements = await Announcement.getAnnouncementsForUser(
        'students',
        student.department,
        student.year,
        student.semester
    );

    res.json({
        success: true,
        announcements
    });
}));

// Mark announcement as viewed
router.post('/announcements/:id/view', asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
        return res.status(404).json({
            success: false,
            message: 'Announcement not found'
        });
    }

    await announcement.markAsViewed(req.user._id);

    res.json({
        success: true,
        message: 'Announcement marked as viewed'
    });
}));

// Get timetable
router.get('/timetable', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    // Get faculty schedules for student's subjects
    const Faculty = require('../models/Faculty');
    const facultySchedules = await Faculty.find({
        'subjects.year': student.year,
        'subjects.semester': student.semester
    }).populate('userId', 'firstName lastName');

    // Filter and format timetable
    const timetable = [];
    facultySchedules.forEach(faculty => {
        faculty.subjects.forEach(subject => {
            if (subject.year === student.year && subject.semester === student.semester) {
                faculty.classes.forEach(classSchedule => {
                    if (classSchedule.subjectCode === subject.subjectCode) {
                        timetable.push({
                            subjectCode: subject.subjectCode,
                            subjectName: subject.subjectName,
                            faculty: `${faculty.userId.firstName} ${faculty.userId.lastName}`,
                            day: classSchedule.day,
                            startTime: classSchedule.startTime,
                            endTime: classSchedule.endTime,
                            room: classSchedule.room
                        });
                    }
                });
            }
        });
    });

    res.json({
        success: true,
        timetable
    });
}));

// Get exam schedule
router.get('/exams', asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    // Mock exam schedule - in real app, this would come from Exam model
    const exams = [
        {
            subjectCode: 'AJP',
            subjectName: 'Advanced Java Programming',
            examDate: new Date('2025-12-25'),
            examTime: '10:00 AM',
            duration: '3 hours',
            room: 'D-204'
        },
        {
            subjectCode: 'BPP',
            subjectName: 'Basics of Python Programming',
            examDate: new Date('2025-12-28'),
            examTime: '10:00 AM',
            duration: '3 hours',
            room: 'D-204'
        },
        {
            subjectCode: 'MT',
            subjectName: 'Mobile Technology',
            examDate: new Date('2025-12-26'),
            examTime: '10:00 AM',
            duration: '3 hours',
            room: 'D-405/B'
        },
        {
            subjectCode: 'WT',
            subjectName: 'Web Technology',
            examDate: new Date('2025-12-28'),
            examTime: '10:00 AM',
            duration: '3 hours',
            room: 'D-405/B'
        }
    ];

    res.json({
        success: true,
        exams
    });
}));

module.exports = router;
