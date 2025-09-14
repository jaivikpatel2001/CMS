# 🎓 Silver Oak University - College Management System

> **A Complete Digital Campus Solution for Students, Faculty, and Administrators**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node.js-v14+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v4.4+-green.svg)

---

## 🌟 What is This Project?

Imagine your college has a **smart digital assistant** that helps everyone manage their daily tasks! This College Management System is exactly that - a web application that makes college life easier for everyone.

### Think of it like this:
- **For Students**: It's like having a personal academic diary that tracks your grades, assignments, attendance, and keeps you updated with announcements
- **For Faculty**: It's like having a digital classroom where you can manage students, grade assignments, and communicate with your class
- **For Administrators**: It's like having a control center where you can oversee everything happening in the college

---

## 🚀 How Does the App Work? (Step-by-Step Flow)

### 1. **Getting Started**
- User opens the website in their browser
- They see a beautiful login page with the Silver Oak University logo
- They enter their username/email and password
- The system checks if they're a student, faculty, or admin

### 2. **Student Experience**
- **Login** → Student dashboard opens
- **View Profile** → See personal details, student ID, course, semester
- **Check Grades** → View marks and grades for all subjects
- **Submit Assignments** → Upload PDF files for homework
- **Check Attendance** → See attendance percentage and records
- **View Timetable** → See today's classes and schedule
- **Submit Complaints** → Report issues to faculty/admin
- **Read Announcements** → Stay updated with college news

### 3. **Faculty Experience**
- **Login** → Faculty dashboard opens
- **Manage Students** → View students enrolled in their courses
- **Create Assignments** → Set homework with due dates and instructions
- **Grade Students** → Give marks and feedback on assignments
- **Mark Attendance** → Take daily attendance for classes
- **Post Announcements** → Share important information with students
- **Handle Complaints** → Respond to student issues

### 4. **Admin Experience**
- **Login** → Admin dashboard opens
- **Manage Users** → Add/edit/remove students and faculty accounts
- **View Statistics** → See college data (total students, faculty, etc.)
- **Post Announcements** → Share college-wide information
- **Handle Complaints** → Manage all student complaints
- **Monitor System** → Keep track of everything happening

---

## 🛠️ Technology Stack (Simple Explanations)

### **Backend Technologies**
- **Node.js**: Think of it as the "engine" that runs the server (like the engine in a car)
- **Express.js**: A framework that makes it easy to create web servers (like having pre-built car parts)
- **MongoDB**: A database that stores all the information (like a digital filing cabinet)
- **Mongoose**: A tool that helps Node.js talk to MongoDB (like a translator)

### **Frontend Technologies**
- **HTML5**: The structure of web pages (like the skeleton of a building)
- **CSS3**: Makes the website look beautiful (like paint and decorations)
- **JavaScript**: Makes the website interactive (like electricity that makes things work)
- **Tailwind CSS**: A design framework for modern, responsive layouts (like having pre-made design templates)

### **Security & Authentication**
- **JWT Tokens**: Secure login system (like a special ID card that proves who you are)
- **bcrypt**: Encrypts passwords safely (like putting passwords in a safe)
- **Multer**: Handles file uploads (like a digital mailroom for documents)

### **Additional Tools**
- **Nodemailer**: Sends emails (like a digital postman)
- **CORS**: Allows the website to work properly (like permission to access different parts)

---

## 📁 Project Structure (Easy to Understand)

```
Silver Oak University Project/
├── 📄 index.html              # The main webpage (like the front door of a house)
├── 🎨 css/styles.css          # Styling rules (like interior design)
├── ⚡ js/app.js               # Interactive features (like smart home controls)
├── 🖥️ server.js              # The main server file (like the main computer)
├── 📦 package.json           # List of required tools (like a shopping list)
│
├── 📂 models/                 # Data templates (like forms to fill out)
│   ├── User.js               # Basic user information template
│   ├── Student.js            # Student-specific information template
│   ├── Faculty.js            # Faculty-specific information template
│   ├── Assignment.js          # Assignment information template
│   ├── Grade.js              # Grade information template
│   ├── Attendance.js         # Attendance information template
│   ├── Complaint.js          # Complaint information template
│   └── Announcement.js       # Announcement information template
│
├── 🛣️ routes/                # Different sections of the website (like different rooms)
│   ├── auth.js              # Login/logout functionality
│   ├── student.js           # Student-only features
│   ├── faculty.js           # Faculty-only features
│   └── admin.js             # Admin-only features
│
├── 🔧 middleware/            # Security and helper functions (like security guards)
│   ├── auth.js              # Checks if users are logged in properly
│   └── upload.js            # Handles file uploads safely
│
├── 📁 uploads/              # Where uploaded files are stored (like a filing cabinet)
│   ├── assignments/         # Student homework files
│   ├── documents/           # Academic documents
│   ├── profiles/            # Profile pictures
│   └── misc/               # Other files
│
└── 🌱 seed.js              # Sample data for testing (like demo content)
```

---

## 📊 Project Variables & Data Storage

This section provides a comprehensive overview of all variables used throughout the project, categorized by their purpose and scope.

### **Environment Variables**
These are configuration settings that can be changed without modifying code:

| Variable | Purpose | Default Value | Example |
|----------|---------|---------------|---------|
| `MONGODB_URI` | Database connection string | `mongodb://localhost:27017/college_management` | `mongodb://localhost:27017/college_management` |
| `PORT` | Server port number | `3000` | `3000` |
| `JWT_SECRET` | Secret key for authentication tokens | Required | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | Token expiration time | `1d` | `1d`, `24h`, `3600s` |
| `EMAIL_USER` | Email service username | Required for email features | `your-email@gmail.com` |
| `EMAIL_PASS` | Email service password | Required for email features | `your-app-password` |
| `NODE_ENV` | Application environment | `development` | `development`, `production` |
| `MAX_FILE_SIZE` | Maximum file upload size | `5242880` (5MB) | `10485760` (10MB) |

### **Server Configuration Variables**
Core server setup and middleware configuration:

| Variable | Purpose | Value |
|----------|---------|-------|
| `app` | Express application instance | Express app object |
| `PORT` | Server listening port | `process.env.PORT \|\| 3000` |
| `cors()` | Cross-origin resource sharing | Enabled for all origins |
| `express.json()` | JSON body parser | Parses incoming JSON requests |
| `express.urlencoded()` | URL-encoded body parser | Extended: true |
| `express.static()` | Static file serving | Serves files from root directory |

### **Database Models & Schema Variables**

#### **User Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `username` | String | Unique login identifier | 3-50 characters, unique |
| `email` | String | User's email address | Valid email format, unique |
| `password` | String | Encrypted password | Minimum 6 characters |
| `role` | String | User type | `student`, `faculty`, `admin` |
| `firstName` | String | User's first name | 2-50 characters |
| `lastName` | String | User's last name | 2-50 characters |
| `phone` | String | Contact number | 10-digit number |
| `isActive` | Boolean | Account status | Default: true |
| `lastLogin` | Date | Last login timestamp | Automatic |
| `resetPasswordToken` | String | Password reset token | Temporary |
| `resetPasswordExpires` | Date | Token expiration | 1 hour from creation |

#### **Student Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `userId` | ObjectId | Reference to User model | Required, unique |
| `enrollmentNumber` | String | Student ID | Required, unique, uppercase |
| `program` | String | Course/program name | Required |
| `year` | Number | Academic year | 1-4 |
| `semester` | Number | Current semester | 1-8 |
| `department` | String | Department name | Required |
| `subjects` | Array | Enrolled subjects | Subject objects with codes |
| `fees` | Object | Fee information | Status, amounts, dates |
| `emergencyContact` | Object | Emergency contact details | Name, relationship, phone |
| `address` | Object | Student address | Street, city, state, pincode |

#### **Faculty Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `userId` | ObjectId | Reference to User model | Required, unique |
| `employeeId` | String | Faculty ID | Required, unique, uppercase |
| `department` | String | Department name | Required |
| `designation` | String | Job title | Professor, Lecturer, etc. |
| `specialization` | String | Subject expertise | Required |
| `qualification` | String | Educational background | Required |
| `experience` | Number | Years of experience | Minimum 0 |
| `subjects` | Array | Teaching subjects | Subject objects with schedules |
| `classes` | Array | Class schedules | Day, time, room details |
| `salary` | Object | Salary information | Basic, allowances, total |
| `joiningDate` | Date | Employment start date | Required |

#### **Assignment Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `title` | String | Assignment title | 5-200 characters |
| `description` | String | Assignment details | 10-1000 characters |
| `subjectCode` | String | Subject identifier | Required, uppercase |
| `subjectName` | String | Subject name | Required |
| `facultyId` | ObjectId | Faculty reference | Required |
| `assignedTo` | Array | Student assignments | Student IDs and enrollment numbers |
| `dueDate` | Date | Submission deadline | Required |
| `maxMarks` | Number | Maximum possible marks | 1-100 |
| `instructions` | String | Additional instructions | Max 500 characters |
| `attachments` | Array | Assignment files | File objects with metadata |
| `submissions` | Array | Student submissions | Submission objects with status |
| `status` | String | Assignment status | `active`, `closed`, `cancelled` |

#### **Grade Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `studentId` | ObjectId | Student reference | Required |
| `enrollmentNumber` | String | Student ID | Required |
| `subjectCode` | String | Subject identifier | Required |
| `subjectName` | String | Subject name | Required |
| `facultyId` | ObjectId | Faculty reference | Required |
| `semester` | Number | Academic semester | 1-8 |
| `year` | Number | Academic year | 1-4 |
| `examType` | String | Type of examination | midterm, final, assignment, etc. |
| `marks` | Object | Mark details | Obtained, total, percentage |
| `grade` | String | Letter grade | A+, A, B+, B, C+, C, D, F |
| `gpa` | Number | Grade point average | 0-10 |
| `remarks` | String | Additional comments | Max 200 characters |
| `examDate` | Date | Examination date | Required |
| `isPassed` | Boolean | Pass/fail status | Calculated from grade |
| `status` | String | Grade status | `published`, `draft`, `under_review` |

#### **Attendance Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `studentId` | ObjectId | Student reference | Required |
| `enrollmentNumber` | String | Student ID | Required |
| `subjectCode` | String | Subject identifier | Required |
| `subjectName` | String | Subject name | Required |
| `facultyId` | ObjectId | Faculty reference | Required |
| `semester` | Number | Academic semester | 1-8 |
| `year` | Number | Academic year | 1-4 |
| `date` | Date | Attendance date | Required |
| `status` | String | Attendance status | `present`, `absent`, `late`, `excused` |
| `remarks` | String | Additional notes | Max 200 characters |
| `markedBy` | ObjectId | Faculty who marked | Required |
| `markedAt` | Date | Marking timestamp | Automatic |
| `classTime` | Object | Class timing | Start and end times |
| `room` | String | Classroom location | Required |

#### **Complaint Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `studentId` | ObjectId | Student reference | Required |
| `enrollmentNumber` | String | Student ID | Required |
| `studentName` | String | Student's full name | Required |
| `department` | String | Department name | Required |
| `complaintType` | String | Type of complaint | academics, infrastructure, etc. |
| `subject` | String | Complaint title | 5-100 characters |
| `description` | String | Detailed description | 10-500 characters |
| `priority` | String | Priority level | `low`, `medium`, `high`, `urgent` |
| `status` | String | Complaint status | submitted, under_review, resolved, etc. |
| `submittedAt` | Date | Submission timestamp | Automatic |
| `assignedTo` | Object | Assignment details | Faculty/admin assignment |
| `resolution` | Object | Resolution details | Description, resolver, date |
| `attachments` | Array | Supporting documents | File objects |
| `feedback` | Object | Student feedback | Rating and comments |
| `isAnonymous` | Boolean | Anonymous submission | Default: false |
| `followUpRequired` | Boolean | Follow-up needed | Default: false |

#### **Announcement Model Variables**
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| `title` | String | Announcement title | Max 200 characters |
| `content` | String | Announcement content | Max 1000 characters |
| `author` | Object | Author information | User ID, name, role |
| `targetAudience` | String | Target audience | all, students, faculty, admin, etc. |
| `department` | String | Department filter | Optional |
| `year` | Number | Year filter | 1-4 |
| `semester` | Number | Semester filter | 1-8 |
| `priority` | String | Priority level | `low`, `medium`, `high`, `urgent` |
| `category` | String | Announcement category | general, academic, exam, etc. |
| `isActive` | Boolean | Active status | Default: true |
| `publishDate` | Date | Publication date | Automatic |
| `expiryDate` | Date | Expiration date | Calculated based on priority |
| `attachments` | Array | File attachments | File objects with metadata |
| `views` | Array | View tracking | User IDs and timestamps |
| `isPinned` | Boolean | Pinned status | Default: false |
| `tags` | Array | Search tags | String array |

### **Frontend JavaScript Variables**

#### **Global Application Variables**
| Variable | Type | Purpose | Scope |
|----------|------|---------|-------|
| `currentUser` | Object | Currently logged-in user | Global |
| `authToken` | String | JWT authentication token | Global |
| `API_BASE_URL` | String | Backend API endpoint | Global |
| `loginForm` | Element | Login form element | DOM |
| `forgotPasswordForm` | Element | Password reset form | DOM |
| `resetPasswordForm` | Element | New password form | DOM |

#### **Form Validation Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `username` | String | User input username | Login validation |
| `password` | String | User input password | Login validation |
| `email` | String | User input email | Registration/forgot password |
| `userType` | String | Selected user role | Role-based validation |
| `firstName` | String | User's first name | Registration form |
| `lastName` | String | User's last name | Registration form |
| `phone` | String | User's phone number | Registration form |
| `role` | String | User role selection | Registration form |

#### **Dashboard State Variables**
| Variable | Type | Purpose | Scope |
|----------|------|---------|-------|
| `loginPage` | Element | Login page container | Dashboard switching |
| `studentDashboard` | Element | Student dashboard container | Dashboard switching |
| `facultyDashboard` | Element | Faculty dashboard container | Dashboard switching |
| `adminDashboard` | Element | Admin dashboard container | Dashboard switching |
| `isLoggedIn` | String | Login status | localStorage |
| `userType` | String | Current user type | localStorage |
| `username` | String | Current username | localStorage |
| `token` | String | Auth token | localStorage |
| `currentUser` | String | User data JSON | localStorage |
| `roleData` | String | Role-specific data JSON | localStorage |

#### **Assignment Submission Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `assignmentId` | String | Assignment identifier | Submission process |
| `file` | File | Uploaded assignment file | File handling |
| `submission` | Object | Submission data | Status tracking |
| `isLate` | Boolean | Late submission flag | Status calculation |
| `status` | String | Submission status | submitted, late, graded |

#### **Complaint Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `complaintType` | String | Type of complaint | Form submission |
| `complaintDetails` | String | Complaint description | Form submission |
| `subject` | String | Complaint subject | Form submission |
| `description` | String | Detailed description | Form submission |
| `priority` | String | Priority level | Form submission |

#### **Password Management Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `newPassword` | String | New password input | Password reset |
| `confirmPassword` | String | Password confirmation | Password reset |
| `currentPassword` | String | Current password | Password change |
| `passwordStrength` | Object | Strength calculation | Password validation |
| `strengthIndicator` | Element | Visual strength meter | UI feedback |

### **Middleware Variables**

#### **Authentication Middleware**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `authHeader` | String | Authorization header | Token extraction |
| `token` | String | JWT token | Token verification |
| `decoded` | Object | Decoded token payload | User identification |
| `user` | Object | User object | Request context |

#### **File Upload Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `uploadsDir` | String | Upload directory path | File storage |
| `uploadPath` | String | Specific upload path | File organization |
| `uniqueSuffix` | String | Unique file identifier | File naming |
| `extension` | String | File extension | File naming |
| `filename` | String | Generated filename | File naming |
| `allowedTypes` | Object | Permitted file types | File validation |
| `fileType` | String | MIME type | File validation |
| `fileExtension` | String | File extension | File validation |

### **API Response Variables**

#### **Standard Response Format**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `success` | Boolean | Operation status | All API responses |
| `message` | String | Response message | All API responses |
| `data` | Object/Array | Response data | Successful operations |
| `error` | String | Error message | Failed operations |
| `errors` | Array | Validation errors | Form validation |
| `pagination` | Object | Pagination info | List responses |

#### **Statistics Variables**
| Variable | Type | Purpose | Usage |
|----------|------|---------|-------|
| `totalStudents` | Number | Total student count | Admin dashboard |
| `totalFaculty` | Number | Total faculty count | Admin dashboard |
| `activeCourses` | Number | Active course count | Admin dashboard |
| `totalUsers` | Number | Total user count | Admin dashboard |
| `totalComplaints` | Number | Total complaint count | Admin dashboard |
| `recentStudents` | Number | Recent student registrations | Admin dashboard |
| `recentFaculty` | Number | Recent faculty registrations | Admin dashboard |
| `pendingComplaints` | Number | Pending complaint count | Admin dashboard |
| `recentAnnouncements` | Number | Recent announcement count | Admin dashboard |
| `activeAssignments` | Number | Active assignment count | Admin dashboard |

### **Configuration Constants**

#### **Email Configuration**
| Variable | Type | Purpose | Value |
|----------|------|---------|-------|
| `service` | String | Email service provider | `gmail` |
| `auth.user` | String | Email username | `process.env.EMAIL_USER` |
| `auth.pass` | String | Email password | `process.env.EMAIL_PASS` |

#### **File Upload Limits**
| Variable | Type | Purpose | Value |
|----------|------|---------|-------|
| `fileSize` | Number | Maximum file size | 5MB default |
| `files` | Number | Maximum files per request | 5 default |
| `assignmentFileSize` | Number | Assignment file limit | 10MB |
| `documentFileSize` | Number | Document file limit | 20MB |
| `profileFileSize` | Number | Profile picture limit | 2MB |

#### **Validation Constants**
| Variable | Type | Purpose | Value |
|----------|------|---------|-------|
| `minUsernameLength` | Number | Minimum username length | 3 |
| `maxUsernameLength` | Number | Maximum username length | 50 |
| `minPasswordLength` | Number | Minimum password length | 6 |
| `minNameLength` | Number | Minimum name length | 2 |
| `maxNameLength` | Number | Maximum name length | 50 |
| `phonePattern` | RegExp | Phone number pattern | `/^[0-9]{10}$/` |
| `emailPattern` | RegExp | Email pattern | `/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/` |

### **Database Index Variables**
These variables optimize database queries for better performance:

| Index | Fields | Purpose |
|-------|--------|---------|
| `userIndex` | `username`, `email` | Fast user lookup |
| `studentIndex` | `enrollmentNumber`, `userId`, `department` | Student queries |
| `facultyIndex` | `employeeId`, `userId`, `department` | Faculty queries |
| `assignmentIndex` | `facultyId`, `subjectCode`, `dueDate` | Assignment queries |
| `gradeIndex` | `studentId`, `subjectCode`, `semester` | Grade queries |
| `attendanceIndex` | `studentId`, `subjectCode`, `date` | Attendance queries |
| `complaintIndex` | `studentId`, `status`, `submittedAt` | Complaint queries |
| `announcementIndex` | `publishDate`, `targetAudience`, `priority` | Announcement queries |

---

## 🎯 Key Features Explained Simply

### **For Students:**
- **Digital Report Card**: See all your grades in one place
- **Assignment Dropbox**: Submit homework online (PDF files only)
- **Attendance Tracker**: Know your attendance percentage
- **Complaint Box**: Report problems to faculty/admin
- **Notice Board**: Read important announcements
- **Class Schedule**: See your daily timetable

### **For Faculty:**
- **Student Manager**: View all students in your classes
- **Assignment Creator**: Set homework with deadlines
- **Grade Book**: Give marks and feedback
- **Attendance Taker**: Mark daily attendance
- **Announcement Board**: Share information with students
- **Complaint Handler**: Respond to student issues

### **For Administrators:**
- **User Manager**: Add/remove students and faculty
- **Statistics Dashboard**: See college overview data
- **System Monitor**: Keep track of everything
- **Announcement Center**: Share college-wide news
- **Complaint Manager**: Handle all student complaints

---

## 🚀 How to Run the Project

### **Step 1: Setup**
1. Make sure you have Node.js installed on your computer
2. Download or clone this project to your computer
3. Open a terminal/command prompt in the project folder

### **Step 2: Install Dependencies**
```bash
npm install
```
(This downloads all the required tools, like installing apps on your phone)

### **Step 3: Setup Database**
1. Install MongoDB on your computer (or use MongoDB Atlas online)
2. Create a `.env` file with your database connection details

### **Step 4: Run the Application**
```bash
npm start
```
(This starts the server, like turning on a computer)

### **Step 5: Access the Website**
- Open your web browser
- Go to `http://localhost:3000`
- You'll see the login page!

---

## 🔑 Test Login Credentials

After setting up the database, you can use these test accounts:

### **Admin Account**
- Username: `admin`
- Password: `admin123`

### **Faculty Account**
- Username: `faculty1`
- Password: `faculty123`

### **Student Account**
- Username: `student1`
- Password: `student123`

> ⚠️ **Important**: These are test accounts! Change passwords in real use.

---

## 🎓 Perfect for Academic Presentations

This project is ideal for 5th-semester students because it demonstrates:

### **Real-World Skills:**
- **Full-Stack Development**: Both frontend and backend programming
- **Database Management**: Working with MongoDB
- **User Authentication**: Secure login systems
- **File Handling**: Upload and manage documents
- **Responsive Design**: Works on all devices

### **Industry-Relevant Technologies:**
- Modern web development practices
- RESTful API design
- Security best practices
- Database design and management
- User experience (UX) design

### **Academic Concepts Applied:**
- Object-Oriented Programming
- Database Normalization
- Software Engineering Principles
- Web Security
- User Interface Design

---

## 🌟 Why This Project Stands Out

1. **Complete Solution**: Not just a simple website, but a full management system
2. **Professional Quality**: Uses industry-standard technologies and practices
3. **User-Friendly**: Beautiful, modern interface that's easy to use
4. **Scalable**: Can be expanded with more features
5. **Secure**: Implements proper security measures
6. **Well-Documented**: Easy to understand and modify

---

## 📞 Support & Questions

If you need help understanding any part of this project:
- Check the code comments (they explain what each part does)
- Look at the file structure (it's organized logically)
- Test the features step by step
- Ask your professor or classmates for help

---

## 🏆 Conclusion

This College Management System is a perfect example of how modern web technologies can solve real-world problems. It shows how programming can create tools that make life easier for everyone - students, faculty, and administrators.

Whether you're presenting this to your professor or using it as a learning tool, this project demonstrates practical programming skills that are valuable in the real world!

---

*Built with ❤️ for Silver Oak University*