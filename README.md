# 🎓 Silver Oak University - College Management System

> **A comprehensive, modern college management system designed for students, faculty, and administrators**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node.js-v14+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v4.4+-green.svg)

## 🌟 What is This System?

The Silver Oak University College Management System is a complete digital solution that helps manage all aspects of college life. Think of it as a **digital campus** where:

- **Students** can view their grades, submit assignments, check attendance, submit complaints, and view announcements
- **Faculty** can manage students, grade assignments, mark attendance, create assignments, post announcements, and handle complaints  
- **Administrators** can oversee everything, manage user accounts, view college statistics, handle complaints, and post announcements

It's like having a **smart assistant** for your college that keeps track of everything automatically!

## Features

### 🔑 Authentication & Authorization
- Role-based login (Student, Faculty, Admin)
- Secure password hashing with bcrypt
- JWT token-based authentication
- Password reset functionality via email
- Role-specific email validation

### 🎓 Student Portal
- View personal profile and academic details
- Check attendance records with percentage calculation
- View exam schedules and results
- Submit assignments (PDF upload only)
- View grades per subject with GPA calculation
- Submit complaints (max 500 characters)
- View announcements from faculty/admin
- View timetable and class schedules
- Access academic documents

### 👨‍🏫 Faculty Portal
- Manage assigned students
- Create and manage assignments
- Mark and update student attendance
- Add/update student grades with feedback
- Post announcements to students
- View and respond to student complaints
- Grade assignment submissions
- View admin announcements

### 🛠️ Admin Portal
- Create and manage all user accounts (Students, Faculty, Admin)
- View comprehensive college statistics
- Post announcements for faculty
- View and manage all student complaints
- Monitor system usage and performance
- User account activation/deactivation
- Email format validation by role

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcrypt password hashing
- **File Upload**: Multer for assignment submissions
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Email**: Nodemailer for password reset functionality

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/college_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Server Configuration
PORT=3000

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### JWT Token Expiration
- **Default**: 1 day (`1d`)
- **Format**: Uses standard JWT expiration formats (e.g., `1d`, `24h`, `1440m`)
- **Auto-logout**: Users are automatically logged out when tokens expire
- **Security**: Tokens are validated on every API request

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/college_management
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env` file

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## Default Login Credentials

After running the database seeding (`npm run seed`), you can use these test accounts:

### Admin
- Username: `admin`
- Password: `admin123`

### Faculty
- Username: `faculty1`
- Password: `faculty123`

### Student
- Username: `student1`
- Password: `student123`

> **⚠️ Important:** These are test accounts! Change the passwords after installation for security.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/grades` - Get student grades with statistics
- `GET /api/student/attendance` - Get attendance records with summary
- `GET /api/student/assignments` - Get assigned assignments
- `POST /api/student/assignments/submit` - Submit assignment
- `POST /api/student/complaints` - Submit complaint
- `GET /api/student/complaints` - Get student complaints
- `GET /api/student/announcements` - Get announcements
- `GET /api/student/timetable` - Get class timetable
- `GET /api/student/exams` - Get exam schedule

### Faculty Routes
- `GET /api/faculty/profile` - Get faculty profile
- `GET /api/faculty/students` - Get assigned students
- `GET /api/faculty/students/subject/:subjectCode` - Get students by subject
- `POST /api/faculty/grades` - Add/update grades
- `GET /api/faculty/grades/subject/:subjectCode` - Get grades by subject
- `PUT /api/faculty/grades/:gradeId` - Update grade
- `DELETE /api/faculty/grades/:gradeId` - Delete grade
- `POST /api/faculty/attendance` - Mark attendance
- `GET /api/faculty/attendance/subject/:subjectCode` - Get attendance by subject
- `PUT /api/faculty/attendance/:attendanceId` - Update attendance
- `DELETE /api/faculty/attendance/:attendanceId` - Delete attendance
- `POST /api/faculty/assignments` - Create assignment
- `GET /api/faculty/assignments` - Get faculty assignments
- `POST /api/faculty/assignments/:assignmentId/grade` - Grade assignment
- `PUT /api/faculty/assignments/:assignmentId` - Update assignment
- `DELETE /api/faculty/assignments/:assignmentId` - Delete assignment
- `POST /api/faculty/announcements` - Post announcement
- `GET /api/faculty/announcements` - Get faculty announcements
- `GET /api/faculty/announcements/feed` - Get admin announcements
- `GET /api/faculty/complaints` - Get student complaints
- `PUT /api/faculty/complaints/:complaintId` - Update complaint status

### Admin Routes
- `GET /api/admin/statistics` - Get college statistics
- `GET /api/admin/users` - Get all users with pagination
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id` - Update complaint status
- `DELETE /api/admin/complaints/:id` - Delete complaint
- `POST /api/admin/announcements` - Post announcement
- `GET /api/admin/announcements` - Get admin announcements
- `GET /api/admin/announcements/all` - Get all announcements
- `PUT /api/admin/announcements/:id` - Update announcement
- `DELETE /api/admin/announcements/:id` - Delete announcement
- `GET /api/admin/assignments` - Get all assignments
- `GET /api/admin/grades` - Get all grades
- `GET /api/admin/attendance` - Get all attendance records

## File Structure

```
college-management-system/
├── models/                 # MongoDB models
│   ├── User.js            # User authentication and basic info
│   ├── Student.js         # Student-specific data
│   ├── Faculty.js         # Faculty-specific data
│   ├── Assignment.js      # Assignment management
│   ├── Grade.js           # Grade management
│   ├── Attendance.js      # Attendance tracking
│   ├── Complaint.js       # Complaint system
│   └── Announcement.js    # Announcement system
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── student.js         # Student-specific routes
│   ├── faculty.js         # Faculty-specific routes
│   └── admin.js           # Admin-specific routes
├── middleware/             # Custom middleware
│   ├── auth.js            # Authentication middleware
│   └── upload.js          # File upload middleware
├── uploads/               # File uploads directory
│   ├── assignments/       # Student assignment submissions
│   ├── documents/         # Academic documents
│   ├── profiles/          # Profile pictures
│   └── misc/              # Other files
├── css/                   # Stylesheets
│   └── styles.css         # Custom CSS
├── js/                    # JavaScript files
│   ├── app.js             # Main application logic
│   └── script.js          # Additional scripts
├── server.js              # Main server file
├── seed.js                # Database seeding script
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload restrictions (PDF only for assignments)
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
