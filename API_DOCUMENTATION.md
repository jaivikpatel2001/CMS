# 🔧 API Documentation - Silver Oak University College Management System

> **Technical reference for developers and system integrators**

This document provides detailed information about all API endpoints, request/response formats, and authentication requirements for the College Management System.

## 📋 Table of Contents

1. [🔐 Authentication](#-authentication)
2. [👨‍🎓 Student API Endpoints](#-student-api-endpoints)
3. [👨‍🏫 Faculty API Endpoints](#-faculty-api-endpoints)
4. [🛠️ Admin API Endpoints](#️-admin-api-endpoints)
5. [📊 Data Models](#-data-models)
6. [🔒 Security](#-security)
7. [❌ Error Handling](#-error-handling)

---

## 🔐 Authentication

### Base URL
```
http://localhost:3000/api
```

### Authentication Method
All API endpoints (except login) require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Login Endpoint
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "student1",
  "password": "student123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "student1",
    "email": "student1@silveroakuni.ac.in",
    "role": "student",
    "firstName": "Divy",
    "lastName": "Patel",
    "phone": "9876543210",
    "lastLogin": "2024-01-15T10:30:00Z"
  },
  "roleData": {
    "enrollmentNumber": "C000001",
    "program": "Diploma in IT",
    "year": 3,
    "semester": 5,
    "department": "Information Technology"
  }
}
```

### Token Expiration
- **Default**: 24 hours (1 day)
- **Format**: Standard JWT expiration
- **Auto-logout**: Frontend handles expired tokens automatically

### Password Reset
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "student1@silveroakuni.ac.in",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

## 👨‍🎓 Student API Endpoints

### Get Student Profile
```http
GET /api/student/profile
```

**Response:**
```json
{
  "success": true,
  "student": {
    "enrollmentNumber": "C000001",
    "program": "Diploma in IT",
    "year": 3,
    "semester": 5,
    "fees": {
      "tuition": 50000,
      "paid": 45000,
      "pending": 5000
    },
    "userId": {
      "firstName": "Divy",
      "lastName": "Patel",
      "email": "student1@silveroakuni.ac.in",
      "phone": "9876543210"
    }
  }
}
```

### Get Student Grades
```http
GET /api/student/grades
```

**Response:**
```json
{
  "success": true,
  "grades": [
    {
      "_id": "grade_id",
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "examType": "final",
      "marks": {
        "obtained": 85,
        "total": 100,
        "percentage": 85
      },
      "grade": "A",
      "gpa": 9,
      "semester": 5,
      "year": 3,
      "examDate": "2024-01-15T00:00:00Z",
      "isPassed": true,
      "status": "published"
    }
  ],
  "statistics": {
    "totalSubjects": 4,
    "averagePercentage": 82.5,
    "averageGPA": 8.2,
    "passedSubjects": 4
  }
}
```

### Get Student Attendance
```http
GET /api/student/attendance
```

**Query Parameters:**
- `semester` (optional): Filter by semester
- `year` (optional): Filter by year

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "attendance_id",
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "date": "2024-01-15T00:00:00Z",
      "status": "present",
      "remarks": "On time",
      "classTime": {
        "start": "11:00",
        "end": "12:40"
      },
      "room": "D-405/B",
      "facultyId": {
        "userId": {
          "firstName": "Vedrucha",
          "lastName": "Pandya"
        }
      }
    }
  ],
  "summary": [
    {
      "_id": "WT",
      "subjectName": "Web Technology",
      "totalClasses": 8,
      "presentClasses": 7,
      "absentClasses": 1,
      "attendancePercentage": 87.5
    }
  ]
}
```

### Get Student Assignments
```http
GET /api/student/assignments
```

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "_id": "assignment_id",
      "title": "PBL-1 (Problem Based Learning)",
      "description": "Complete the web development project",
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "dueDate": "2024-02-15",
      "maxMarks": 100,
      "submissionStatus": "not_submitted"
    }
  ]
}
```

### Submit Assignment
```http
POST /api/student/assignments/submit
```

**Request (FormData):**
```
assignmentId: assignment_id
assignment: <PDF file>
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "submission": {
    "status": "submitted",
    "submittedAt": "2024-01-15T10:30:00Z",
    "isLate": false
  }
}
```

### Submit Complaint
```http
POST /api/student/complaints
```

**Request Body:**
```json
{
  "complaintType": "academics",
  "subject": "Assignment Submission Issue",
  "description": "Unable to submit assignment due to technical issues",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "id": "complaint_id",
    "complaintType": "academics",
    "subject": "Assignment Submission Issue",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 👨‍🏫 Faculty API Endpoints

### Get Assigned Students
```http
GET /api/faculty/students
```

**Query Parameters:**
- `course` (optional): Filter by course code

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "enrollmentNumber": "C000001",
      "userId": {
        "firstName": "Divy",
        "lastName": "Patel",
        "email": "student1@silveroakuni.ac.in"
      },
      "program": "Diploma in IT",
      "year": 3,
      "semester": 5
    }
  ]
}
```

### Get Student Grades (Faculty View)
```http
GET /api/faculty/grades
```

**Query Parameters:**
- `course` (optional): Filter by course code
- `studentId` (optional): Filter by specific student

**Response:**
```json
{
  "success": true,
  "grades": [
    {
      "studentId": {
        "enrollmentNumber": "C000001",
        "userId": {
          "firstName": "Divy",
          "lastName": "Patel"
        }
      },
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "marks": {
        "obtained": 85,
        "total": 100
      },
      "grade": "A",
      "comments": "Good work"
    }
  ]
}
```

### Add/Update Student Grade
```http
POST /api/faculty/grades
```

**Request Body:**
```json
{
  "studentId": "student_id",
  "subjectCode": "WT",
  "examType": "final",
  "marks": 85,
  "totalMarks": 100,
  "examDate": "2024-01-15",
  "remarks": "Good work"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Grade added successfully",
  "grade": {
    "_id": "grade_id",
    "studentId": "student_id",
    "subjectCode": "WT",
    "subjectName": "Web Technology",
    "examType": "final",
    "marks": {
      "obtained": 85,
      "total": 100,
      "percentage": 85
    },
    "grade": "A",
    "gpa": 9,
    "examDate": "2024-01-15T00:00:00Z",
    "remarks": "Good work",
    "isPassed": true
  }
}
```

### Mark Student Attendance
```http
POST /api/faculty/attendance
```

**Request Body:**
```json
{
  "studentId": "student_id",
  "subjectCode": "WT",
  "date": "2024-01-15",
  "status": "present",
  "classTime": {
    "start": "11:00",
    "end": "12:40"
  },
  "room": "D-405/B",
  "remarks": "On time"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendance": {
    "_id": "attendance_id",
    "studentId": "student_id",
    "subjectCode": "WT",
    "subjectName": "Web Technology",
    "date": "2024-01-15T00:00:00Z",
    "status": "present",
    "remarks": "On time",
    "classTime": {
      "start": "11:00",
      "end": "12:40"
    },
    "room": "D-405/B"
  }
}
```

### Create Assignment
```http
POST /api/faculty/assignments
```

**Request Body:**
```json
{
  "title": "PBL-1 (Problem Based Learning)",
  "description": "Complete the web development project",
  "subjectCode": "WT",
  "dueDate": "2024-02-15T23:59:00Z",
  "maxMarks": 100,
  "instructions": "Submit as PDF file"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment created successfully",
  "assignment": {
    "_id": "assignment_id",
    "title": "PBL-1 (Problem Based Learning)",
    "description": "Complete the web development project",
    "subjectCode": "WT",
    "subjectName": "Web Technology",
    "dueDate": "2024-02-15T23:59:00Z",
    "maxMarks": 100,
    "instructions": "Submit as PDF file",
    "status": "active",
    "assignedTo": [
      {
        "studentId": "student_id",
        "enrollmentNumber": "C000001"
      }
    ]
  }
}
```

### Post Announcement
```http
POST /api/faculty/announcements
```

**Request Body:**
```json
{
  "title": "Assignment Deadline Extended",
  "content": "The assignment deadline has been extended to next week",
  "targetAudience": "students",
  "department": "Information Technology",
  "priority": "medium",
  "category": "academic"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement posted successfully",
  "announcement": {
    "_id": "announcement_id",
    "title": "Assignment Deadline Extended",
    "content": "The assignment deadline has been extended to next week",
    "author": {
      "userId": "faculty_id",
      "name": "Faculty Name",
      "role": "faculty"
    },
    "targetAudience": "students",
    "department": "Information Technology",
    "priority": "medium",
    "category": "academic",
    "publishDate": "2024-01-15T10:30:00Z"
  }
}
```

### Get Student Complaints
```http
GET /api/faculty/complaints
```

**Response:**
```json
{
  "success": true,
  "complaints": [
    {
      "complaintType": "Academics",
      "subject": "Assignment Submission Issue",
      "description": "Unable to submit assignment",
      "status": "pending",
      "studentId": {
        "enrollmentNumber": "C000001",
        "userId": {
          "firstName": "Divy",
          "lastName": "Patel"
        }
      },
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🛠️ Admin API Endpoints

### Get All Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `role` (optional): Filter by role (student, faculty, admin)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of users per page

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "username": "student1",
      "email": "student1@silveroakuni.ac.in",
      "firstName": "Divy",
      "lastName": "Patel",
      "role": "student",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50
  }
}
```

### Create New User
```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "username": "newstudent",
  "email": "newstudent@silveroakuni.ac.in",
  "password": "password123",
  "firstName": "New",
  "lastName": "Student",
  "role": "student",
  "phone": "9876543210",
  "enrollmentNumber": "IT2024002",
  "program": "B.Tech",
  "year": 1,
  "semester": 1,
  "department": "Information Technology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "new_user_id",
    "username": "newstudent",
    "email": "newstudent@silveroakuni.ac.in",
    "firstName": "New",
    "lastName": "Student",
    "role": "student",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update User
```http
PUT /api/admin/users/:id
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@silveroakuni.ac.in",
  "phone": "9876543211",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "firstName": "Updated",
    "lastName": "Name",
    "email": "updated@silveroakuni.ac.in"
  }
}
```

### Delete User
```http
DELETE /api/admin/users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get College Statistics
```http
GET /api/admin/statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalStudents": 150,
    "totalFaculty": 25,
    "totalAdmins": 3,
    "totalComplaints": 8,
    "pendingComplaints": 3,
    "totalAnnouncements": 12,
    "activeAnnouncements": 8,
    "totalAssignments": 45,
    "totalGrades": 1200,
    "totalAttendanceRecords": 2500
  }
}
```

### Get All Complaints
```http
GET /api/admin/complaints
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, resolved, in_progress)
- `priority` (optional): Filter by priority (low, medium, high)

**Response:**
```json
{
  "success": true,
  "complaints": [
    {
      "complaintType": "Infrastructure",
      "subject": "Lab Equipment Issue",
      "description": "Computers in lab are not working",
      "status": "pending",
      "priority": "high",
      "studentId": {
        "enrollmentNumber": "C000001",
        "userId": {
          "firstName": "Divy",
          "lastName": "Patel"
        }
      },
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Post Admin Announcement
```http
POST /api/admin/announcements
```

**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "College will be closed tomorrow for maintenance",
  "targetAudience": "faculty",
  "department": "All",
  "priority": "high",
  "category": "general"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement posted successfully",
  "announcement": {
    "_id": "announcement_id",
    "title": "Important Notice",
    "content": "College will be closed tomorrow for maintenance",
    "author": {
      "userId": "admin_id",
      "name": "Admin Name",
      "role": "admin"
    },
    "targetAudience": "faculty",
    "department": "All",
    "priority": "high",
    "category": "general",
    "publishDate": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📊 Data Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  firstName: String (required),
  lastName: String (required),
  phone: String,
  role: String (enum: ['student', 'faculty', 'admin']),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Student Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  enrollmentNumber: String (required, unique),
  program: String (required),
  year: Number (required, min: 1, max: 4),
  semester: Number (required, min: 1, max: 8),
  department: String (required),
  subjects: [String],
  fees: {
    tuition: Number,
    paid: Number,
    pending: Number
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}
```

### Faculty Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  employeeId: String (required, unique),
  designation: String (required),
  department: String (required),
  specialization: String,
  qualification: String,
  experience: Number,
  subjects: [String],
  classes: [String],
  salary: Number,
  joiningDate: Date
}
```

### Assignment Model
```javascript
{
  title: String (required),
  description: String,
  subjectCode: String (required),
  subjectName: String (required),
  facultyId: ObjectId (ref: 'Faculty'),
  assignedTo: [ObjectId] (ref: 'Student'),
  dueDate: Date (required),
  maxMarks: Number (required),
  instructions: String,
  attachments: [String],
  submissions: [{
    studentId: ObjectId (ref: 'Student'),
    file: String,
    status: String (enum: ['submitted', 'graded', 'late']),
    submittedAt: Date,
    marks: Number,
    feedback: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Grade Model
```javascript
{
  studentId: ObjectId (ref: 'Student'),
  enrollmentNumber: String (required),
  subjectCode: String (required),
  subjectName: String (required),
  facultyId: ObjectId (ref: 'Faculty'),
  semester: Number (required),
  year: Number (required),
  examType: String (required),
  marks: {
    obtained: Number (required),
    total: Number (required),
    percentage: Number
  },
  grade: String (required),
  gpa: Number,
  remarks: String,
  examDate: Date,
  isPassed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model
```javascript
{
  studentId: ObjectId (ref: 'Student'),
  enrollmentNumber: String (required),
  subjectCode: String (required),
  subjectName: String (required),
  facultyId: ObjectId (ref: 'Faculty'),
  semester: Number (required),
  year: Number (required),
  date: Date (required),
  status: String (enum: ['present', 'absent', 'late', 'excused']),
  remarks: String,
  classTime: {
    start: String,
    end: String
  },
  room: String,
  markedBy: ObjectId (ref: 'Faculty')
}
```

### Complaint Model
```javascript
{
  studentId: ObjectId (ref: 'Student'),
  enrollmentNumber: String (required),
  studentName: String (required),
  department: String (required),
  complaintType: String (required),
  subject: String (required),
  description: String (required, max: 500 characters),
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['pending', 'in_progress', 'resolved']),
  submittedAt: Date,
  assignedTo: ObjectId (ref: 'Faculty'),
  resolution: String,
  attachments: [String],
  feedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Announcement Model
```javascript
{
  title: String (required),
  content: String (required),
  author: {
    userId: ObjectId (ref: 'User'),
    name: String (required),
    role: String (required)
  },
  targetAudience: String (enum: ['students', 'faculty', 'all']),
  department: String,
  year: Number,
  semester: Number,
  priority: String (enum: ['low', 'medium', 'high']),
  category: String,
  isActive: Boolean (default: true),
  publishDate: Date,
  expiryDate: Date,
  attachments: [String],
  views: [{
    userId: ObjectId (ref: 'User'),
    viewedAt: Date
  }],
  isPinned: Boolean (default: false),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security

### Authentication
- **JWT Tokens**: All API requests require valid JWT tokens
- **Token Expiration**: Tokens expire after 24 hours
- **Password Hashing**: Passwords are hashed using bcryptjs
- **Role-Based Access**: Users can only access endpoints for their role
- **Password Reset**: Email-based password reset with secure tokens
- **Email Validation**: Role-specific email format validation (students: @silveroakuni.ac.in, faculty: @silveroakuni.ac.in, admin: @silveroakuni.ac.in)

### Input Validation
- **File Upload Security**: Only PDF files allowed for assignments
- **Input Sanitization**: All inputs are validated and sanitized
- **MongoDB Injection Protection**: MongoDB queries are parameterized
- **Request Validation**: Custom middleware validates request bodies

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## ❌ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Wrong username/password
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: Malformed or invalid token
- `ACCESS_DENIED`: User doesn't have permission
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_ENTRY`: Resource already exists
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error
- `EMAIL_ALREADY_EXISTS`: Email address already registered
- `USERNAME_ALREADY_EXISTS`: Username already taken
- `INVALID_EMAIL_FORMAT`: Email format doesn't match role requirements
- `FILE_UPLOAD_ERROR`: Error uploading file
- `INVALID_FILE_TYPE`: File type not allowed
- `ASSIGNMENT_NOT_FOUND`: Assignment doesn't exist
- `STUDENT_NOT_FOUND`: Student doesn't exist
- `FACULTY_NOT_FOUND`: Faculty doesn't exist

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

### Example Error Responses

**Authentication Error:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Token Expired:**
```json
{
  "success": false,
  "message": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 🔧 Environment Variables

### Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/college_management

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@silveroakuni.ac.in

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Optional Environment Variables
```bash
# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100

# Token Expiration
JWT_EXPIRES_IN=24h
```

---

## 📞 Support

### API Testing
- **Test Environment**: Use test credentials for API testing
- **Default Test Accounts**: Available after running seed script
- **API Endpoints**: All endpoints documented with examples

### Rate Limiting
- **Default**: No rate limiting implemented
- **Authentication**: Standard JWT token validation
- **File Upload**: 5MB maximum file size for assignments

### Monitoring
- **Logging**: Basic console logging for development
- **Error Tracking**: Standard error handling with detailed messages
- **Performance**: Basic response time logging

---

**This API documentation provides comprehensive information for integrating with the College Management System. For additional support, contact your system administrator.**

*Last updated: January 2025 | Version 1.0.0*
