# College Management System

A comprehensive college management system built with Node.js, Express, MongoDB, and modern web technologies.

## Features

### 🔑 Authentication & Authorization
- Role-based login (Student, Faculty, Admin)
- Secure password hashing with bcrypt
- JWT token-based authentication
- Password reset functionality

### 🎓 Student Portal
- View personal profile and academic details
- Check attendance records
- View exam schedules and results
- Submit assignments (PDF upload)
- View grades per subject
- Submit complaints (max 150 words)
- View announcements and events
- Download academic documents

### 👨‍🏫 Faculty Portal
- Manage student information
- Upload and manage assignments
- Mark and update student attendance
- Add/update student grades
- Post announcements
- View student complaints
- Submit event requests

### 🛠️ Admin Portal
- Manage faculty and admin accounts
- Approve/reject event requests
- Post announcements for faculty
- View all student complaints
- College statistics dashboard

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

### Admin
- Username: `admin`
- Password: `admin123`

### Faculty
- Username: `faculty`
- Password: `faculty123`

### Student
- Username: `student`
- Password: `student123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/grades` - Get student grades
- `GET /api/student/attendance` - Get attendance records
- `POST /api/student/assignments/submit` - Submit assignment
- `POST /api/student/complaints` - Submit complaint

### Faculty Routes
- `GET /api/faculty/students` - Get assigned students
- `POST /api/faculty/grades` - Add/update grades
- `POST /api/faculty/attendance` - Mark attendance
- `POST /api/faculty/announcements` - Post announcement
- `GET /api/faculty/complaints` - View complaints

### Admin Routes
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/events` - Get event requests
- `PUT /api/admin/events/:id` - Approve/reject event

## File Structure

```
college-management-system/
├── models/                 # MongoDB models
│   ├── User.js
│   ├── Student.js
│   ├── Faculty.js
│   ├── Admin.js
│   ├── Assignment.js
│   ├── Grade.js
│   ├── Attendance.js
│   ├── Complaint.js
│   └── Announcement.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── student.js
│   ├── faculty.js
│   └── admin.js
├── middleware/             # Custom middleware
│   ├── auth.js
│   └── upload.js
├── controllers/            # Route controllers
│   ├── authController.js
│   ├── studentController.js
│   ├── facultyController.js
│   └── adminController.js
├── uploads/               # File uploads directory
├── public/               # Static files
├── server.js             # Main server file
├── package.json
└── README.md
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
