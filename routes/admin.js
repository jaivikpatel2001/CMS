const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const { authenticateToken, authorizeRole, validateRequest, asyncHandler } = require('../middleware/auth');

// Email validation functions
function validateStudentEmail(email) {
    const pattern = /^[0-9]{13}@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateFacultyEmail(email) {
    const pattern = /^[0-9]{5,7}@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateAdminEmail(email) {
    const pattern = /^admin[a-z]*@silveroakuni\.ac\.in$/;
    return pattern.test(email);
}

function validateEmailByRole(email, role) {
    switch (role) {
        case 'student':
            return validateStudentEmail(email);
        case 'faculty':
            return validateFacultyEmail(email);
        case 'admin':
            return validateAdminEmail(email);
        default:
            return false;
    }
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Get college statistics
router.get('/statistics', asyncHandler(async (req, res) => {
    try {
        // Get counts from database
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();
        
        // Get unique courses from students
        const coursesData = await Student.aggregate([
            { $group: { _id: '$course' } },
            { $count: 'totalCourses' }
        ]);
        const activeCourses = coursesData.length > 0 ? coursesData[0].totalCourses : 0;
        
        // Get additional statistics
        const totalUsers = await User.countDocuments();
        const totalComplaints = await Complaint.countDocuments();
        const totalAnnouncements = await Announcement.countDocuments();
        
        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentStudents = await Student.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        const recentFaculty = await Faculty.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            success: true,
            statistics: {
                totalStudents,
                totalFaculty,
                activeCourses,
                totalUsers,
                totalComplaints,
                totalAnnouncements,
                recentStudents,
                recentFaculty
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
}));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) {
        query.role = role;
    }

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
        success: true,
        users,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

// Get user by ID
router.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get role-specific data
    let roleData = {};
    if (user.role === 'student') {
        roleData = await Student.findOne({ userId: user._id });
    } else if (user.role === 'faculty') {
        roleData = await Faculty.findOne({ userId: user._id });
    }

    res.json({
        success: true,
        user,
        roleData
    });
}));

// Create new user
router.post('/users', validateRequest({
    username: { required: true, minLength: 3, maxLength: 50 },
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 6 },
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    role: { required: true, enum: ['student', 'faculty', 'admin'] },
    phone: { type: 'phone' }
}), asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this username or email already exists'
        });
    }

    // Validate email format based on role
    if (!validateEmailByRole(email.toLowerCase(), role)) {
        let errorMessage = '';
        switch (role) {
            case 'student':
                errorMessage = 'Student email must be a 13-digit number followed by @silveroakuni.ac.in (e.g., 1234567890123@silveroakuni.ac.in)';
                break;
            case 'faculty':
                errorMessage = 'Faculty email must be a 5-7 digit number followed by @silveroakuni.ac.in (e.g., 12345@silveroakuni.ac.in)';
                break;
            case 'admin':
                errorMessage = 'Admin email must start with "admin" followed by @silveroakuni.ac.in (e.g., admin@silveroakuni.ac.in)';
                break;
            default:
                errorMessage = 'Invalid email format for the selected role';
        }
        
        return res.status(400).json({
            success: false,
            message: errorMessage
        });
    }

    // Create new user
    const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role,
        phone
    });

    await user.save();

    // Create role-specific record
    if (role === 'student') {
        const providedSemester = Number(req.body.semester) || 1;
        const computedYear = Math.min(4, Math.max(1, Math.ceil(providedSemester / 2)));
        const enrollmentNumber = (req.body.studentId ? String(req.body.studentId).trim().toUpperCase() : '') || `C${Date.now().toString().slice(-6)}`;
        const student = new Student({
            userId: user._id,
            enrollmentNumber,
            program: (req.body.course || 'Diploma in IT').trim(),
            year: computedYear,
            semester: providedSemester,
            department: (req.body.department || 'Information Technology').trim(),
            fees: {
                semesterFees: 20000,
                status: 'pending',
                nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        await student.save();
    } else if (role === 'faculty') {
        const employeeId = (req.body.employeeId ? String(req.body.employeeId).trim().toUpperCase() : '') || `F${Date.now().toString().slice(-6)}`;
        const designation = req.body.designation || 'Lecturer';
        const department = req.body.department || 'Information Technology';
        const faculty = new Faculty({
            userId: user._id,
            employeeId,
            department: department.trim(),
            designation: designation,
            specialization: 'Computer Science',
            qualification: 'M.Tech',
            experience: 0,
            joiningDate: new Date(),
            salary: {
                basic: 50000,
                allowances: 10000,
                total: 60000
            }
        });
        await faculty.save();
    }

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone
        }
    });
}));

// Update user
router.put('/users/:id', asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const previousRole = user.role;

    // Update basic user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) {
        // Validate email format based on role
        const targetRole = role || user.role;
        if (!validateEmailByRole(email.toLowerCase(), targetRole)) {
            let errorMessage = '';
            switch (targetRole) {
                case 'student':
                    errorMessage = 'Student email must be a 13-digit number followed by @silveroakuni.ac.in (e.g., 1234567890123@silveroakuni.ac.in)';
                    break;
                case 'faculty':
                    errorMessage = 'Faculty email must be a 5-7 digit number followed by @silveroakuni.ac.in (e.g., 12345@silveroakuni.ac.in)';
                    break;
                case 'admin':
                    errorMessage = 'Admin email must start with "admin" followed by @silveroakuni.ac.in (e.g., admin@silveroakuni.ac.in)';
                    break;
                default:
                    errorMessage = 'Invalid email format for the selected role';
            }
            
            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
        user.email = email.toLowerCase();
    }
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    // Update role-specific data if role changed
    if (role && role !== previousRole) {
        // Remove old role-specific data based on previous role
        if (previousRole === 'student') {
            await Student.findOneAndDelete({ userId: user._id });
        } else if (previousRole === 'faculty') {
            await Faculty.findOneAndDelete({ userId: user._id });
        }

        // Create new role-specific data based on new role
        if (role === 'student') {
            const providedSemester = Number(req.body.semester) || 1;
            const computedYear = Math.min(4, Math.max(1, Math.ceil(providedSemester / 2)));
            const enrollmentNumber = (req.body.studentId ? String(req.body.studentId).trim().toUpperCase() : '') || `C${Date.now().toString().slice(-6)}`;
            const student = new Student({
                userId: user._id,
                enrollmentNumber,
                program: (req.body.course || 'Diploma in IT').trim(),
                year: computedYear,
                semester: providedSemester,
                department: (req.body.department || 'Information Technology').trim()
            });
            await student.save();
        } else if (role === 'faculty') {
            const employeeId = (req.body.employeeId ? String(req.body.employeeId).trim().toUpperCase() : '') || `F${Date.now().toString().slice(-6)}`;
            const designation = req.body.designation || 'Lecturer';
            const department = req.body.department || 'Information Technology';
            const faculty = new Faculty({
                userId: user._id,
                employeeId,
                department: department.trim(),
                designation: designation,
                specialization: 'Computer Science',
                qualification: 'M.Tech',
                experience: 0,
                joiningDate: new Date(),
                salary: {
                    basic: 50000,
                    allowances: 10000,
                    total: 60000
                }
            });
            await faculty.save();
        }
    } else {
        // Update existing role-specific data
        if (user.role === 'student') {
            let student = await Student.findOne({ userId: user._id });
            if (!student) {
                // Create missing student document on the fly
                const providedSemester = Number(req.body.semester) || 1;
                const computedYear = Math.min(4, Math.max(1, Math.ceil(providedSemester / 2)));
                student = new Student({
                    userId: user._id,
                    enrollmentNumber: (req.body.studentId ? String(req.body.studentId).trim().toUpperCase() : '') || `C${Date.now().toString().slice(-6)}`,
                    program: (req.body.course || 'Diploma in IT').trim(),
                    year: computedYear,
                    semester: providedSemester,
                    department: (req.body.department || 'Information Technology').trim()
                });
            } else {
                if (req.body.studentId) student.enrollmentNumber = String(req.body.studentId).trim().toUpperCase();
                if (req.body.course) student.program = req.body.course;
                if (req.body.department) student.department = req.body.department;
                if (req.body.semester) student.semester = Number(req.body.semester);
            }
            await student.save();
        } else if (user.role === 'faculty') {
            let faculty = await Faculty.findOne({ userId: user._id });
            if (!faculty) {
                // Create missing faculty document on the fly
                faculty = new Faculty({
                    userId: user._id,
                    employeeId: (req.body.employeeId ? String(req.body.employeeId).trim().toUpperCase() : '') || `F${Date.now().toString().slice(-6)}`,
                    department: (req.body.department || 'Information Technology').trim(),
                    designation: req.body.designation || 'Lecturer',
                    specialization: 'Computer Science',
                    qualification: 'M.Tech',
                    experience: 0,
                    joiningDate: new Date(),
                    salary: { basic: 50000, allowances: 10000, total: 60000 }
                });
            } else {
                if (req.body.employeeId) faculty.employeeId = req.body.employeeId;
                if (req.body.department) faculty.department = req.body.department;
                if (req.body.designation) faculty.designation = req.body.designation;
            }
            await faculty.save();
        }
    }

    res.json({
        success: true,
        message: 'User updated successfully',
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive
        }
    });
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin users cannot be deleted'
        });
    }

    // Delete role-specific data
    if (user.role === 'student') {
        await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'faculty') {
        await Faculty.findOneAndDelete({ userId: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
}));

// Get college statistics
router.get('/statistics', asyncHandler(async (req, res) => {
    const [
        totalStudents,
        totalFaculty,
        totalAdmins,
        activeStudents,
        activeFaculty,
        recentComplaints,
        recentAnnouncements,
        totalAssignments
    ] = await Promise.all([
        Student.countDocuments(),
        Faculty.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
        Complaint.countDocuments({ 
            submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }),
        Announcement.countDocuments({ 
            publishDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }),
        Assignment.countDocuments()
    ]);

    // Get department-wise student count
    const departmentStats = await Student.aggregate([
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    // Get year-wise student count
    const yearStats = await Student.aggregate([
        {
            $group: {
                _id: '$year',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.json({
        success: true,
        statistics: {
            users: {
                totalStudents,
                totalFaculty,
                totalAdmins,
                activeStudents,
                activeFaculty
            },
            activities: {
                recentComplaints,
                recentAnnouncements,
                totalAssignments
            },
            departmentStats,
            yearStats
        }
    });
}));

// Get all complaints
router.get('/complaints', asyncHandler(async (req, res) => {
    const { status, department, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
        query.status = status;
    }
    if (department) {
        query.department = department;
    }

    const complaints = await Complaint.find(query)
        .populate('studentId', 'userId enrollmentNumber')
        .populate('studentId.userId', 'firstName lastName email')
        .sort({ submittedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
        success: true,
        complaints,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

// Update complaint status
router.put('/complaints/:id', validateRequest({
    status: { required: true, enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected'] },
    resolution: { maxLength: 500 },
    actionTaken: { maxLength: 300 },
    assignedTo: { maxLength: 100 }
}), asyncHandler(async (req, res) => {
    const { status, resolution, actionTaken, assignedTo } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: 'Complaint not found'
        });
    }

    await complaint.updateStatus(status, req.user._id, resolution);
    
    if (actionTaken) {
        complaint.resolution.actionTaken = actionTaken;
    }
    
    if (assignedTo) {
        complaint.assignedTo.adminId = req.user._id;
    }

    await complaint.save();

    res.json({
        success: true,
        message: 'Complaint status updated successfully',
        complaint
    });
}));

// Delete complaint
router.delete('/complaints/:id', asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: 'Complaint not found'
        });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Complaint deleted successfully'
    });
}));

// Post announcement
router.post('/announcements', validateRequest({
    title: { required: true, minLength: 5, maxLength: 200 },
    content: { required: true, minLength: 10, maxLength: 1000 },
    targetAudience: { required: true, enum: ['all', 'students', 'faculty', 'admin', 'specific_department', 'specific_year'] },
    department: { maxLength: 50 },
    year: { type: 'number', min: 1, max: 4 },
    priority: { enum: ['low', 'medium', 'high', 'urgent'] },
    category: { enum: ['general', 'academic', 'exam', 'event', 'maintenance', 'emergency', 'other'] },
    isPinned: { enum: [true, false] }
}), asyncHandler(async (req, res) => {
    const { title, content, targetAudience, department, year, priority = 'medium', category = 'general', isPinned = false } = req.body;

    const announcement = new Announcement({
        title,
        content,
        author: {
            userId: req.user._id,
            name: `${req.user.firstName} ${req.user.lastName}`,
            role: 'admin'
        },
        targetAudience,
        department,
        year,
        priority,
        category,
        isPinned
    });

    await announcement.save();

    res.json({
        success: true,
        message: 'Announcement posted successfully',
        announcement
    });
}));

// Get admin announcements
router.get('/announcements', asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({
        'author.userId': req.user._id,
        'author.role': 'admin'
    }).sort({ publishDate: -1 });

    res.json({
        success: true,
        announcements
    });
}));

// Get all announcements
router.get('/announcements/all', asyncHandler(async (req, res) => {
    const { targetAudience, department, priority, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (targetAudience) {
        query.targetAudience = targetAudience;
    }
    if (department) {
        query.department = department;
    }
    if (priority) {
        query.priority = priority;
    }

    const announcements = await Announcement.find(query)
        .populate('author.userId', 'firstName lastName')
        .sort({ isPinned: -1, publishDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
        success: true,
        announcements,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

// Update announcement
router.put('/announcements/:id', validateRequest({
    title: { minLength: 5, maxLength: 200 },
    content: { minLength: 10, maxLength: 1000 },
    priority: { enum: ['low', 'medium', 'high', 'urgent'] },
    isActive: { enum: [true, false] },
    isPinned: { enum: [true, false] }
}), asyncHandler(async (req, res) => {
    const { title, content, priority, isActive, isPinned } = req.body;
    
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
        return res.status(404).json({
            success: false,
            message: 'Announcement not found'
        });
    }

    if (announcement.author.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this announcement'
        });
    }

    // Update allowed fields
    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (priority !== undefined) announcement.priority = priority;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();

    res.json({
        success: true,
        message: 'Announcement updated successfully',
        announcement
    });
}));

// Delete announcement
router.delete('/announcements/:id', asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
        return res.status(404).json({
            success: false,
            message: 'Announcement not found'
        });
    }

    if (announcement.author.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this announcement'
        });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Announcement deleted successfully'
    });
}));

// Get event requests (mock implementation)
router.get('/events', asyncHandler(async (req, res) => {
    // In a real application, this would fetch from an Event model
    const events = [
        {
            id: '1',
            title: 'Tech Fest 2025',
            description: 'Annual technology festival',
            requestedBy: 'Faculty',
            requestedAt: new Date('2025-01-15'),
            status: 'pending',
            department: 'Information Technology'
        },
        {
            id: '2',
            title: 'Sports Day',
            description: 'Annual sports competition',
            requestedBy: 'Faculty',
            requestedAt: new Date('2025-01-10'),
            status: 'approved',
            department: 'Physical Education'
        }
    ];

    res.json({
        success: true,
        events
    });
}));

// Approve/Reject event
router.put('/events/:id', validateRequest({
    status: { required: true, enum: ['approved', 'rejected'] },
    comments: { maxLength: 200 }
}), asyncHandler(async (req, res) => {
    const { status, comments } = req.body;
    
    // In a real application, this would update an Event model
    res.json({
        success: true,
        message: `Event ${status} successfully`,
        event: {
            id: req.params.id,
            status,
            comments,
            reviewedBy: req.user._id,
            reviewedAt: new Date()
        }
    });
}));

// Get dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
    const [
        totalStudents,
        totalFaculty,
        pendingComplaints,
        recentAnnouncements,
        activeAssignments
    ] = await Promise.all([
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
        Complaint.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
        Announcement.countDocuments({ 
            publishDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        Assignment.countDocuments({ status: 'active' })
    ]);

    // Get recent complaints
    const recentComplaints = await Complaint.find({ status: { $in: ['submitted', 'under_review'] } })
        .populate('studentId', 'userId enrollmentNumber')
        .populate('studentId.userId', 'firstName lastName')
        .sort({ submittedAt: -1 })
        .limit(5);

    // Get recent announcements
    const announcements = await Announcement.find({ isActive: true })
        .populate('author.userId', 'firstName lastName')
        .sort({ publishDate: -1 })
        .limit(5);

    res.json({
        success: true,
        dashboard: {
            statistics: {
                totalStudents,
                totalFaculty,
                pendingComplaints,
                recentAnnouncements,
                activeAssignments
            },
            recentComplaints,
            announcements
        }
    });
}));

// Get all assignments (admin view)
router.get('/assignments', asyncHandler(async (req, res) => {
    const { status, facultyId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
        query.status = status;
    }
    if (facultyId) {
        query.facultyId = facultyId;
    }

    const assignments = await Assignment.find(query)
        .populate('facultyId', 'userId employeeId')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.json({
        success: true,
        assignments,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

// Get all grades (admin view)
router.get('/grades', asyncHandler(async (req, res) => {
    const { studentId, facultyId, subjectCode, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (studentId) {
        query.studentId = studentId;
    }
    if (facultyId) {
        query.facultyId = facultyId;
    }
    if (subjectCode) {
        query.subjectCode = subjectCode;
    }

    const grades = await Grade.find(query)
        .populate('studentId', 'userId enrollmentNumber')
        .populate('studentId.userId', 'firstName lastName')
        .populate('facultyId', 'userId employeeId')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ examDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Grade.countDocuments(query);

    res.json({
        success: true,
        grades,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

// Get all attendance records (admin view)
router.get('/attendance', asyncHandler(async (req, res) => {
    const { studentId, facultyId, subjectCode, date, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (studentId) {
        query.studentId = studentId;
    }
    if (facultyId) {
        query.facultyId = facultyId;
    }
    if (subjectCode) {
        query.subjectCode = subjectCode;
    }
    if (date) {
        query.date = new Date(date);
    }

    const attendance = await Attendance.find(query)
        .populate('studentId', 'userId enrollmentNumber')
        .populate('studentId.userId', 'firstName lastName')
        .populate('facultyId', 'userId employeeId')
        .populate('facultyId.userId', 'firstName lastName')
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
        success: true,
        attendance,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
}));

module.exports = router;
