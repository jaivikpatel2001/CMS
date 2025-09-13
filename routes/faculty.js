const express = require('express');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const { authenticateToken, authorizeRole, validateRequest, asyncHandler } = require('../middleware/auth');
const { uploadDocument, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeRole('faculty'));

// Get faculty profile
router.get('/profile', asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne({ userId: req.user._id })
        .populate('userId', 'firstName lastName email phone');

    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    res.json({
        success: true,
        faculty
    });
}));

// Get assigned students
router.get('/students', asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    // Get students enrolled in faculty's subjects
    const students = await Student.find({
        'subjects.facultyId': faculty._id
    }).populate('userId', 'firstName lastName email phone');

    res.json({
        success: true,
        students
    });
}));

// Get students by subject
router.get('/students/subject/:subjectCode', asyncHandler(async (req, res) => {
    const { subjectCode } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const students = await Student.find({
        'subjects.subjectCode': subjectCode,
        'subjects.facultyId': faculty._id
    }).populate('userId', 'firstName lastName email phone');

    res.json({
        success: true,
        students
    });
}));

// Add/Update student grades
router.post('/grades', validateRequest({
    studentId: { required: true },
    subjectCode: { required: true },
    examType: { required: true, enum: ['midterm', 'final', 'assignment', 'quiz', 'project', 'practical'] },
    marks: { required: true, type: 'number', min: 0 },
    totalMarks: { required: true, type: 'number', min: 1 },
    examDate: { required: true },
    remarks: { maxLength: 200 }
}), asyncHandler(async (req, res) => {
    const { studentId, subjectCode, examType, marks, totalMarks, examDate, remarks } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Check if faculty teaches this subject to this student
    const subject = student.subjects.find(sub => 
        sub.subjectCode === subjectCode && sub.facultyId.toString() === faculty._id.toString()
    );

    if (!subject) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to grade this subject for this student'
        });
    }

    // Calculate percentage and grade
    const percentage = Math.round((marks / totalMarks) * 100);
    const grade = calculateGrade(percentage);

    // Check if grade already exists
    const existingGrade = await Grade.findOne({
        studentId,
        subjectCode,
        examType,
        semester: student.semester,
        year: student.year
    });

    if (existingGrade) {
        // Update existing grade
        existingGrade.marks.obtained = marks;
        existingGrade.marks.total = totalMarks;
        existingGrade.marks.percentage = percentage;
        existingGrade.grade = grade;
        existingGrade.gpa = gradeToGPA(grade);
        existingGrade.examDate = new Date(examDate);
        existingGrade.remarks = remarks;
        existingGrade.isPassed = grade !== 'F';

        await existingGrade.save();

        res.json({
            success: true,
            message: 'Grade updated successfully',
            grade: existingGrade
        });
    } else {
        // Create new grade
        const newGrade = new Grade({
            studentId,
            enrollmentNumber: student.enrollmentNumber,
            subjectCode,
            subjectName: subject.subjectName,
            facultyId: faculty._id,
            semester: student.semester,
            year: student.year,
            examType,
            marks: {
                obtained: marks,
                total: totalMarks,
                percentage: percentage
            },
            grade,
            gpa: gradeToGPA(grade),
            examDate: new Date(examDate),
            remarks,
            isPassed: grade !== 'F'
        });

        await newGrade.save();

        res.json({
            success: true,
            message: 'Grade added successfully',
            grade: newGrade
        });
    }
}));

// Get grades for a subject
router.get('/grades/subject/:subjectCode', asyncHandler(async (req, res) => {
    const { subjectCode } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const grades = await Grade.find({
        subjectCode,
        facultyId: faculty._id
    }).populate('studentId', 'userId enrollmentNumber')
    .populate('studentId.userId', 'firstName lastName');

    res.json({
        success: true,
        grades
    });
}));

// Update grade
router.put('/grades/:gradeId', validateRequest({
    marks: { type: 'number', min: 0 },
    totalMarks: { type: 'number', min: 1 },
    examDate: { type: 'date' },
    remarks: { maxLength: 200 },
    status: { enum: ['published', 'draft', 'under_review'] }
}), asyncHandler(async (req, res) => {
    const { gradeId } = req.params;
    const { marks, totalMarks, examDate, remarks, status } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const grade = await Grade.findById(gradeId);
    if (!grade) {
        return res.status(404).json({
            success: false,
            message: 'Grade not found'
        });
    }

    if (grade.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this grade'
        });
    }

    // Update allowed fields
    if (marks !== undefined) grade.marks.obtained = marks;
    if (totalMarks !== undefined) grade.marks.total = totalMarks;
    if (examDate !== undefined) grade.examDate = new Date(examDate);
    if (remarks !== undefined) grade.remarks = remarks;
    if (status !== undefined) grade.status = status;

    // Recalculate percentage and grade if marks changed
    if (marks !== undefined || totalMarks !== undefined) {
        grade.marks.percentage = Math.round((grade.marks.obtained / grade.marks.total) * 100);
        grade.grade = grade.calculateGrade();
        grade.gpa = gradeToGPA(grade.grade);
        grade.isPassed = grade.grade !== 'F';
    }

    await grade.save();

    res.json({
        success: true,
        message: 'Grade updated successfully',
        grade
    });
}));

// Delete grade
router.delete('/grades/:gradeId', asyncHandler(async (req, res) => {
    const { gradeId } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const grade = await Grade.findById(gradeId);
    if (!grade) {
        return res.status(404).json({
            success: false,
            message: 'Grade not found'
        });
    }

    if (grade.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this grade'
        });
    }

    await Grade.findByIdAndDelete(gradeId);

    res.json({
        success: true,
        message: 'Grade deleted successfully'
    });
}));

// Mark attendance
router.post('/attendance', validateRequest({
    studentId: { required: true },
    subjectCode: { required: true },
    date: { required: true },
    status: { required: true, enum: ['present', 'absent', 'late', 'excused'] },
    classTime: { required: true },
    room: { required: true },
    remarks: { maxLength: 200 }
}), asyncHandler(async (req, res) => {
    const { studentId, subjectCode, date, status, classTime, room, remarks } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Check if faculty teaches this subject to this student
    const subject = student.subjects.find(sub => 
        sub.subjectCode === subjectCode && sub.facultyId.toString() === faculty._id.toString()
    );

    if (!subject) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to mark attendance for this subject'
        });
    }

    // Check if attendance already marked for this date
    const existingAttendance = await Attendance.findOne({
        studentId,
        subjectCode,
        date: new Date(date)
    });

    if (existingAttendance) {
        return res.status(400).json({
            success: false,
            message: 'Attendance already marked for this date'
        });
    }

    const attendance = new Attendance({
        studentId,
        enrollmentNumber: student.enrollmentNumber,
        subjectCode,
        subjectName: subject.subjectName,
        facultyId: faculty._id,
        semester: student.semester,
        year: student.year,
        date: new Date(date),
        status,
        remarks,
        markedBy: faculty._id,
        classTime: {
            start: classTime.start,
            end: classTime.end
        },
        room
    });

    await attendance.save();

    res.json({
        success: true,
        message: 'Attendance marked successfully',
        attendance
    });
}));

// Get attendance for a subject
router.get('/attendance/subject/:subjectCode', asyncHandler(async (req, res) => {
    const { subjectCode } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const attendance = await Attendance.find({
        subjectCode,
        facultyId: faculty._id
    }).populate('studentId', 'userId enrollmentNumber')
    .populate('studentId.userId', 'firstName lastName')
    .sort({ date: -1 });

    res.json({
        success: true,
        attendance
    });
}));

// Update attendance
router.put('/attendance/:attendanceId', validateRequest({
    status: { enum: ['present', 'absent', 'late', 'excused'] },
    remarks: { maxLength: 200 }
}), asyncHandler(async (req, res) => {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
        return res.status(404).json({
            success: false,
            message: 'Attendance record not found'
        });
    }

    if (attendance.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this attendance record'
        });
    }

    // Update allowed fields
    if (status !== undefined) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({
        success: true,
        message: 'Attendance updated successfully',
        attendance
    });
}));

// Delete attendance
router.delete('/attendance/:attendanceId', asyncHandler(async (req, res) => {
    const { attendanceId } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
        return res.status(404).json({
            success: false,
            message: 'Attendance record not found'
        });
    }

    if (attendance.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this attendance record'
        });
    }

    await Attendance.findByIdAndDelete(attendanceId);

    res.json({
        success: true,
        message: 'Attendance record deleted successfully'
    });
}));

// Create assignment
router.post('/assignments', validateRequest({
    title: { required: true, minLength: 5, maxLength: 200 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    subjectCode: { required: true },
    dueDate: { required: true },
    maxMarks: { required: true, type: 'number', min: 1, max: 100 },
    instructions: { maxLength: 500 }
}), asyncHandler(async (req, res) => {
    const { title, description, subjectCode, dueDate, maxMarks, instructions } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    // Check if faculty teaches this subject
    const subject = faculty.subjects.find(sub => sub.subjectCode === subjectCode);
    if (!subject) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to create assignments for this subject'
        });
    }

    // Get students enrolled in this subject
    const students = await Student.find({
        'subjects.subjectCode': subjectCode,
        'subjects.facultyId': faculty._id
    });

    const assignedTo = students.map(student => ({
        studentId: student._id,
        enrollmentNumber: student.enrollmentNumber
    }));

    const assignment = new Assignment({
        title,
        description,
        subjectCode,
        subjectName: subject.subjectName,
        facultyId: faculty._id,
        assignedTo,
        dueDate: new Date(dueDate),
        maxMarks,
        instructions
    });

    await assignment.save();

    res.json({
        success: true,
        message: 'Assignment created successfully',
        assignment
    });
}));

// Get assignments created by faculty
router.get('/assignments', asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const assignments = await Assignment.find({ facultyId: faculty._id })
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        assignments
    });
}));

// Grade assignment submission
router.post('/assignments/:assignmentId/grade', validateRequest({
    studentId: { required: true },
    marks: { required: true, type: 'number', min: 0 },
    feedback: { maxLength: 500 }
}), asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const { studentId, marks, feedback } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({
            success: false,
            message: 'Assignment not found'
        });
    }

    if (assignment.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to grade this assignment'
        });
    }

    const submission = assignment.submissions.find(sub => 
        sub.studentId.toString() === studentId
    );

    if (!submission) {
        return res.status(404).json({
            success: false,
            message: 'Submission not found'
        });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await assignment.save();

    res.json({
        success: true,
        message: 'Assignment graded successfully',
        submission
    });
}));

// Update assignment
router.put('/assignments/:assignmentId', validateRequest({
    title: { minLength: 5, maxLength: 200 },
    description: { minLength: 10, maxLength: 1000 },
    dueDate: { type: 'date' },
    maxMarks: { type: 'number', min: 1, max: 100 },
    instructions: { maxLength: 500 },
    status: { enum: ['active', 'closed', 'cancelled'] }
}), asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const { title, description, dueDate, maxMarks, instructions, status } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({
            success: false,
            message: 'Assignment not found'
        });
    }

    if (assignment.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this assignment'
        });
    }

    // Update allowed fields
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = new Date(dueDate);
    if (maxMarks !== undefined) assignment.maxMarks = maxMarks;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (status !== undefined) assignment.status = status;

    await assignment.save();

    res.json({
        success: true,
        message: 'Assignment updated successfully',
        assignment
    });
}));

// Delete assignment
router.delete('/assignments/:assignmentId', asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({
            success: false,
            message: 'Assignment not found'
        });
    }

    if (assignment.facultyId.toString() !== faculty._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this assignment'
        });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.json({
        success: true,
        message: 'Assignment deleted successfully'
    });
}));

// Post announcement
router.post('/announcements', validateRequest({
    title: { required: true, minLength: 5, maxLength: 200 },
    content: { required: true, minLength: 10, maxLength: 1000 },
    targetAudience: { required: true, enum: ['all', 'students', 'specific_department', 'specific_year'] },
    department: { maxLength: 50 },
    year: { type: 'number', min: 1, max: 4 },
    priority: { enum: ['low', 'medium', 'high', 'urgent'] },
    category: { enum: ['general', 'academic', 'exam', 'event', 'maintenance', 'emergency', 'other'] }
}), asyncHandler(async (req, res) => {
    const { title, content, targetAudience, department, year, priority = 'medium', category = 'general' } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const announcement = new Announcement({
        title,
        content,
        author: {
            userId: req.user._id,
            name: `${req.user.firstName} ${req.user.lastName}`,
            role: 'faculty'
        },
        targetAudience,
        department: department || faculty.department,
        year,
        priority,
        category
    });

    await announcement.save();

    res.json({
        success: true,
        message: 'Announcement posted successfully',
        announcement
    });
}));

// Get faculty announcements
router.get('/announcements', asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({
        'author.userId': req.user._id,
        'author.role': 'faculty'
    }).sort({ publishDate: -1 });

    res.json({
        success: true,
        announcements
    });
}));

// Get admin announcements feed for faculty (cross-visibility)
router.get('/announcements/feed', asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    // Fetch announcements targeted to faculty (or all), optionally filtered by department
    const announcements = await Announcement.getAnnouncementsForUser(
        'faculty',
        faculty.department
    );

    res.json({
        success: true,
        announcements
    });
}));

// Get student complaints
router.get('/complaints', asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const complaints = await Complaint.find({
        department: faculty.department,
        status: { $in: ['submitted', 'under_review'] }
    }).populate('studentId', 'userId enrollmentNumber')
    .populate('studentId.userId', 'firstName lastName')
    .sort({ submittedAt: -1 });

    res.json({
        success: true,
        complaints
    });
}));

// Update complaint status
router.put('/complaints/:complaintId', validateRequest({
    status: { required: true, enum: ['under_review', 'in_progress', 'resolved', 'rejected'] },
    resolution: { maxLength: 500 },
    actionTaken: { maxLength: 300 }
}), asyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const { status, resolution, actionTaken } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (!faculty) {
        return res.status(404).json({
            success: false,
            message: 'Faculty profile not found'
        });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: 'Complaint not found'
        });
    }

    if (complaint.department !== faculty.department) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to handle this complaint'
        });
    }

    await complaint.updateStatus(status, req.user._id, resolution);
    
    if (actionTaken) {
        complaint.resolution.actionTaken = actionTaken;
        await complaint.save();
    }

    res.json({
        success: true,
        message: 'Complaint status updated successfully',
        complaint
    });
}));

// Helper functions
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
}

function gradeToGPA(grade) {
    const gradeToGPA = {
        'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 
        'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    return gradeToGPA[grade] || 0;
}

module.exports = router;
