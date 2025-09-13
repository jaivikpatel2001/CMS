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
  "password": "student123",
  "role": "student"
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
    "lastName": "Patel"
  }
}
```

### Token Expiration
- **Default**: 24 hours (1 day)
- **Format**: Standard JWT expiration
- **Auto-logout**: Frontend handles expired tokens automatically

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
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "marks": {
        "obtained": 85,
        "total": 100
      },
      "grade": "A",
      "semester": 5,
      "year": 3
    }
  ],
  "statistics": {
    "totalSubjects": 4,
    "averageMarks": 82.5,
    "gpa": 3.7
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
      "subjectCode": "WT",
      "subjectName": "Web Technology",
      "date": "2024-01-15",
      "status": "present",
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
    "assignmentId": "assignment_id",
    "studentId": "student_id",
    "submittedAt": "2024-01-15T10:30:00Z",
    "filePath": "uploads/assignments/student_id/file.pdf"
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
  "complaintType": "Academics",
  "subject": "Assignment Submission Issue",
  "description": "Unable to submit assignment due to technical issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "complaintType": "Academics",
    "subject": "Assignment Submission Issue",
    "description": "Unable to submit assignment due to technical issues",
    "status": "pending",
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
  "subjectName": "Web Technology",
  "marks": {
    "obtained": 85,
    "total": 100
  },
  "grade": "A",
  "comments": "Good work",
  "semester": 5,
  "year": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Grade added successfully",
  "grade": {
    "studentId": "student_id",
    "subjectCode": "WT",
    "marks": {
      "obtained": 85,
      "total": 100
    },
    "grade": "A",
    "comments": "Good work"
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
  "subjectName": "Web Technology",
  "date": "2024-01-15",
  "status": "present",
  "remarks": "On time",
  "classTime": {
    "start": "09:00",
    "end": "10:30"
  },
  "room": "Lab-101"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendance": {
    "studentId": "student_id",
    "subjectCode": "WT",
    "date": "2024-01-15",
    "status": "present",
    "remarks": "On time"
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
  "title": "Web Development Project",
  "description": "Create a responsive website",
  "subjectCode": "WT",
  "subjectName": "Web Technology",
  "dueDate": "2024-02-15",
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
    "title": "Web Development Project",
    "subjectCode": "WT",
    "dueDate": "2024-02-15",
    "maxMarks": 100
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
  "message": "The assignment deadline has been extended to next week",
  "targetAudience": "students"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement posted successfully",
  "announcement": {
    "title": "Assignment Deadline Extended",
    "message": "The assignment deadline has been extended to next week",
    "postedBy": "faculty_id",
    "postedAt": "2024-01-15T10:30:00Z"
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
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "new_user_id",
    "username": "newstudent",
    "email": "newstudent@silveroakuni.ac.in",
    "role": "student",
    "isActive": true
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
    "activeCourses": 12,
    "totalComplaints": 8,
    "pendingComplaints": 3,
    "recentRegistrations": 5
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
  "message": "College will be closed tomorrow for maintenance",
  "targetAudience": "faculty"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement posted successfully",
  "announcement": {
    "title": "Important Notice",
    "message": "College will be closed tomorrow for maintenance",
    "postedBy": "admin_id",
    "postedAt": "2024-01-15T10:30:00Z"
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
  subjects: [String],
  salary: Number,
  experience: Number,
  qualification: String,
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
  dueDate: Date (required),
  maxMarks: Number (required),
  instructions: String,
  createdBy: ObjectId (ref: 'Faculty'),
  submissions: [{
    studentId: ObjectId (ref: 'Student'),
    submittedAt: Date,
    filePath: String,
    marks: Number,
    feedback: String
  }]
}
```

### Grade Model
```javascript
{
  studentId: ObjectId (ref: 'Student'),
  subjectCode: String (required),
  subjectName: String (required),
  marks: {
    obtained: Number (required),
    total: Number (required)
  },
  grade: String (required),
  comments: String,
  semester: Number (required),
  year: Number (required),
  createdBy: ObjectId (ref: 'Faculty')
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
  complaintType: String (required),
  subject: String (required),
  description: String (required, max: 150 words),
  status: String (enum: ['pending', 'in_progress', 'resolved']),
  priority: String (enum: ['low', 'medium', 'high']),
  response: String,
  resolvedBy: ObjectId (ref: 'Faculty'),
  resolvedAt: Date,
  submittedAt: Date
}
```

### Announcement Model
```javascript
{
  title: String (required),
  message: String (required, max: 150 words),
  targetAudience: String (enum: ['students', 'faculty', 'all']),
  postedBy: ObjectId (ref: 'User'),
  postedAt: Date,
  isActive: Boolean (default: true)
}
```

---

## 🔒 Security

### Authentication
- **JWT Tokens**: All API requests require valid JWT tokens
- **Token Expiration**: Tokens expire after 24 hours
- **Password Hashing**: Passwords are hashed using bcrypt
- **Role-Based Access**: Users can only access endpoints for their role

### Input Validation
- **Email Validation**: Role-specific email format validation
- **File Upload Security**: Only PDF files allowed for assignments
- **Input Sanitization**: All inputs are validated and sanitized
- **SQL Injection Protection**: MongoDB queries are parameterized

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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

## 📞 Support

### API Testing
- **Postman Collection**: Available for download
- **Swagger Documentation**: Interactive API documentation
- **Test Environment**: Use test credentials for API testing

### Rate Limiting
- **Default**: 100 requests per hour per IP
- **Authentication**: 10 login attempts per hour per IP
- **File Upload**: 5MB maximum file size

### Monitoring
- **Logging**: All API requests are logged
- **Error Tracking**: Detailed error logs for debugging
- **Performance**: Response time monitoring

---

**This API documentation provides comprehensive information for integrating with the College Management System. For additional support, contact your system administrator.**

*Last updated: January 2024 | Version 1.0.0*
