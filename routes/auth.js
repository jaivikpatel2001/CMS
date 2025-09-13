const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { authenticateToken, authorizeRole, validateRequest, asyncHandler } = require('../middleware/auth');

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate JWT token
const generateToken = (userId) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// Login route (role-less)
router.post('/login', validateRequest({
    username: { required: true, minLength: 3 },
    password: { required: true, minLength: 6 }
}), asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Find active user by username or email (role inferred from user record)
    const user = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: username.toLowerCase() }
        ],
        isActive: true
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
        message: 'Invalid credentials'
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Get role-specific data (based on user.role)
    let roleData = {};
    if (user.role === 'student') {
        roleData = await Student.findOne({ userId: user._id });
    } else if (user.role === 'faculty') {
        roleData = await Faculty.findOne({ userId: user._id });
    }

    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            lastLogin: user.lastLogin
        },
        roleData
    });
}));

// Register route (Admin only)
router.post('/register', authenticateToken, authorizeRole('admin'), validateRequest({
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
        const enrollmentNumber = `C${Date.now().toString().slice(-6)}`;
        const student = new Student({
            userId: user._id,
            enrollmentNumber,
            program: 'Diploma in IT',
            year: 1,
            semester: 1,
            department: 'Information Technology'
        });
        await student.save();
    } else if (role === 'faculty') {
        const employeeId = `F${Date.now().toString().slice(-6)}`;
        const faculty = new Faculty({
            userId: user._id,
            employeeId,
            department: 'Information Technology',
            designation: 'Lecturer',
            specialization: 'Computer Science',
            qualification: 'M.Tech',
            experience: 0,
            joiningDate: new Date()
        });
        await faculty.save();
    }

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    });
}));

// Forgot password route
router.post('/forgot-password', validateRequest({
    email: { required: true, type: 'email' },
    role: { required: true, enum: ['student', 'faculty', 'admin'] }
}), asyncHandler(async (req, res) => {
    const { email, role } = req.body;

    const user = await User.findOne({
        email: email.toLowerCase(),
        role: role,
        isActive: true
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    try {
        const transporter = createTransporter();
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request - Silver Oak University',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8b3d4f;">Password Reset Request</h2>
                    <p>Hello ${user.firstName},</p>
                    <p>You have requested to reset your password for your ${role} account at Silver Oak University.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="background-color: #8b3d4f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>Silver Oak University</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Password reset link sent to your email'
        });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reset email'
        });
    }
}));

// Reset password route
router.post('/reset-password', validateRequest({
    token: { required: true },
    password: { required: true, minLength: 6 }
}), asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully'
    });
}));

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const user = req.user;
    
    // Get role-specific data
    let roleData = {};
    if (user.role === 'student') {
        roleData = await Student.findOne({ userId: user._id });
    } else if (user.role === 'faculty') {
        roleData = await Faculty.findOne({ userId: user._id });
    }

    res.json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        },
        roleData
    });
}));

// Update user profile
router.put('/profile', authenticateToken, validateRequest({
    firstName: { minLength: 2, maxLength: 50 },
    lastName: { minLength: 2, maxLength: 50 },
    phone: { type: 'phone' }
}), asyncHandler(async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const user = req.user;

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
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

// Change password
router.put('/change-password', authenticateToken, validateRequest({
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 6 }
}), asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
}));

// Logout (client-side token removal)
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}));

module.exports = router;
