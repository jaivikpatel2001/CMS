# 🛠️ Installation Guide - Silver Oak University College Management System

> **Step-by-step guide to set up the system on your computer**

This guide will help you install and set up the College Management System on your computer. Don't worry if you're not technical - we'll explain everything in simple terms!

## 🎯 What You'll Need

### Computer Requirements:
- **Windows 10/11, Mac, or Linux** computer
- **4GB RAM** minimum (8GB recommended)
- **5GB free disk space**
- **Internet connection** for downloading software

### Software You'll Install:
- **Node.js** - Runs the system (like installing an app)
- **MongoDB** - Stores all the data (like a digital filing cabinet)
- **Git** - Downloads the system files (optional)

## 🚀 Quick Start (For Non-Technical Users)

### Step 1: Download Required Software

#### Install Node.js:
1. **Go to**: https://nodejs.org/
2. **Download**: Click the "LTS" version (recommended)
3. **Run the installer**: Follow the installation wizard
4. **Restart your computer** after installation

#### Install MongoDB:
1. **Go to**: https://www.mongodb.com/try/download/community
2. **Select**: Your operating system (Windows, Mac, or Linux)
3. **Download**: The community server version
4. **Run the installer**: Follow the installation wizard
5. **Start MongoDB**: It should start automatically

### Step 2: Get the System Files

#### Option A: Download ZIP (Easiest)
1. **Download** the system files as a ZIP folder
2. **Extract** the ZIP to a folder on your computer
3. **Remember** where you put the folder

#### Option B: Use Git (If you have it)
1. **Open** Command Prompt or Terminal
2. **Navigate** to where you want the files
3. **Run**: `git clone [repository-url]`

### Step 3: Install System Dependencies

1. **Open Command Prompt** (Windows) or Terminal (Mac/Linux)
2. **Navigate** to the system folder:
   ```bash
   cd path/to/college-management-system
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
   *This downloads all the required components (like installing app dependencies)*

### Step 4: Configure the System

1. **Create a file** called `.env` in the system folder
2. **Add these settings**:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/college_management
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRES_IN=1d
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   ```

### Step 5: Set Up the Database

1. **Make sure MongoDB is running** (should start automatically)
2. **Run the database setup**:
   ```bash
   npm run seed
   ```
   *This creates sample data to test the system*

### Step 6: Start the System

1. **Start the application**:
   ```bash
   npm start
   ```
2. **Open your browser**
3. **Go to**: http://localhost:3000
4. **You should see** the login page!

## 🔧 Detailed Installation (For Technical Users)

## 🔑 Default Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin

### Faculty Account
- **Username:** `faculty`
- **Password:** `faculty123`
- **Role:** Faculty

### Student Account
- **Username:** `student`
- **Password:** `student123`
- **Role:** Student

## 📋 Features Overview

### 🎓 Student Portal
- **Profile Management:** View personal details, enrollment info
- **Grades:** View grades for all subjects
- **Attendance:** Check attendance records and percentage
- **Assignments:** Submit assignments (PDF files)
- **Complaints:** Submit complaints (max 150 words)
- **Announcements:** View announcements from faculty/admin
- **Timetable:** View class schedule
- **Exams:** View exam schedule

### 👨‍🏫 Faculty Portal
- **Student Management:** View assigned students
- **Grade Management:** Add/update student grades
- **Attendance:** Mark student attendance
- **Assignment Management:** Create and manage assignments
- **Complaint Handling:** View and respond to student complaints
- **Announcements:** Post announcements to students

### 🛠️ Admin Portal
- **User Management:** Create/manage students, faculty, and admin accounts
- **Complaint Management:** View and manage all complaints
- **Announcement Management:** Post announcements for faculty
- **Statistics:** View college statistics and reports
- **Event Management:** Approve/reject event requests

## 🗄️ Database Schema

### Collections
- **users:** User authentication and basic info
- **students:** Student-specific data (enrollment, program, fees)
- **faculty:** Faculty-specific data (subjects, salary, classes)
- **assignments:** Assignment details and submissions
- **grades:** Student grades and exam results
- **attendance:** Attendance records
- **complaints:** Student complaints and resolutions
- **announcements:** System announcements

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/college_management
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf
```

### File Uploads
- **Location:** `uploads/` directory
- **Assignment Files:** `uploads/assignments/`
- **Documents:** `uploads/documents/`
- **Profile Pictures:** `uploads/profiles/`
- **Other Files:** `uploads/misc/`

## 🛠️ Development

### Project Structure
```
college-management-system/
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Custom middleware
├── uploads/               # File uploads
├── public/               # Static files
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── server.js             # Main server file
├── package.json
└── README.md
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/grades` - Get student grades
- `GET /api/student/attendance` - Get attendance records
- `POST /api/student/assignments/submit` - Submit assignment
- `POST /api/student/complaints` - Submit complaint

#### Faculty Routes
- `GET /api/faculty/students` - Get assigned students
- `POST /api/faculty/grades` - Add/update grades
- `POST /api/faculty/attendance` - Mark attendance
- `POST /api/faculty/announcements` - Post announcement

#### Admin Routes
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/complaints` - Get all complaints
- `POST /api/admin/announcements` - Post announcement

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in .env file
   - Verify MongoDB is accessible on the specified port

2. **File Upload Issues**
   - Check file size limits
   - Ensure uploads directory has write permissions
   - Verify file type restrictions

3. **Authentication Errors**
   - Check JWT secret in .env file
   - Verify token expiration settings
   - Ensure proper headers in API requests

4. **Email Configuration**
   - Update EMAIL_USER and EMAIL_PASS in .env
   - Use app-specific passwords for Gmail
   - Check SMTP settings

### Logs and Debugging
- Server logs are displayed in the console
- Check browser console for frontend errors
- Use MongoDB Compass to inspect database

## 📝 Usage Examples

### Creating a New Student (Admin)
1. Login as admin
2. Go to "Manage Users" section
3. Click "Add New User"
4. Fill in student details
5. System automatically creates enrollment number

### Submitting an Assignment (Student)
1. Login as student
2. Go to "Assignments" section
3. Select assignment from dropdown
4. Upload PDF file
5. Click "Submit"

### Marking Attendance (Faculty)
1. Login as faculty
2. Go to "Manage Attendance" section
3. Select class and date
4. Mark students as present/absent
5. Save attendance

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs for errors
4. Verify database connectivity

## 🎯 Future Enhancements

- Real-time notifications
- Mobile app integration
- Advanced reporting features
- Email notifications
- Calendar integration
- Document management system
