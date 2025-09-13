const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and populate role-specific data
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

// Middleware to check user role
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware to check if user owns the resource
const authorizeResource = (resourceIdParam = 'id') => {
    return (req, res, next) => {
        const resourceId = req.params[resourceIdParam];
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        if (req.user._id.toString() !== resourceId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this resource'
            });
        }

        next();
    };
};

// Middleware to validate request body
const validateRequest = (validationRules) => {
    return (req, res, next) => {
        const errors = [];

        for (const field in validationRules) {
            const rules = validationRules[field];
            const value = req.body[field];

            // Required validation
            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Skip other validations if field is empty and not required
            if (!value || value.toString().trim() === '') {
                continue;
            }

            // Type validation
            if (rules.type === 'email' && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                errors.push(`${field} must be a valid email address`);
            }

            if (rules.type === 'phone' && !/^[0-9]{10}$/.test(value)) {
                errors.push(`${field} must be a valid 10-digit phone number`);
            }

            // Length validation
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters long`);
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must not exceed ${rules.maxLength} characters`);
            }

            // Enum validation
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }

            // Number validation
            if (rules.type === 'number') {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    errors.push(`${field} must be a valid number`);
                } else {
                    if (rules.min !== undefined && numValue < rules.min) {
                        errors.push(`${field} must be at least ${rules.min}`);
                    }
                    if (rules.max !== undefined && numValue > rules.max) {
                        errors.push(`${field} must not exceed ${rules.max}`);
                    }
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    };
};

// Middleware to handle async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Middleware to log requests
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
};

module.exports = {
    authenticateToken,
    authorizeRole,
    authorizeResource,
    validateRequest,
    asyncHandler,
    requestLogger
};
