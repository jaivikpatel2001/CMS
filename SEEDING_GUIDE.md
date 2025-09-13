# Database Seeding Guide for College Management System

## 🌱 What is Database Seeding?

Database seeding is the process of populating your database with initial sample data. This helps you test the application with realistic data instead of starting with empty tables.

## 🚀 How to Seed the Database

### Method 1: Using npm script (Recommended)
```bash
npm run seed
```

### Method 2: Direct execution
```bash
node seed.js
```

## 📊 What Data Gets Created

The seeding script creates comprehensive sample data including:

### 👥 **Users (10 total)**
- **1 Admin:** System Administrator
- **4 Faculty:** Vedrucha Pandya, Krupa Soni, Manav Thakar, Moksha Patel
- **5 Students:** Divy Patel, Raj Shah, Priya Mehta, Arjun Desai, Kavya Joshi

### 🎓 **Students (5 total)**
- Enrollment numbers: C000001 to C000005
- Program: Diploma in IT (Year 3, Semester 5)
- Subjects: Web Technology, Advanced Java Programming, Mobile Technology, Python Programming
- Complete profile information including fees, emergency contacts, addresses

### 👨‍🏫 **Faculty (4 total)**
- Employee IDs: F001 to F004
- Different designations: Assistant Professor, Lecturer
- Subject assignments and class schedules
- Salary information and experience details

### 📝 **Assignments (2 total)**
- PBL-1 (Problem Based Learning) - Web Technology
- WT-Assignment 1 - Advanced Java Programming
- Assigned to all students with due dates and instructions

### 📊 **Grades (20 total)**
- Grades for all students in all subjects
- Random marks between 60-100
- Proper grade calculation (A+, A, B+, B, C+, C, D, F)
- GPA calculation

### 📅 **Attendance Records (160 total)**
- 8 days of attendance for each student in each subject
- Mix of present, absent, and late statuses
- Realistic attendance patterns

### 📢 **Complaints (4 total)**
- Infrastructure issues (lab equipment, ventilation)
- Academic issues (assignment submission)
- Faculty-related complaints
- Different priority levels

### 📢 **Announcements (4 total)**
- Exam schedules
- Library hours
- Assignment deadlines
- Event notifications

## 🔑 Default Login Credentials After Seeding

### Admin
- **Username:** `admin`
- **Password:** `admin123`

### Faculty
- **Username:** `faculty1` (Vedrucha Pandya)
- **Password:** `faculty123`

### Students
- **Username:** `student1` (Divy Patel)
- **Password:** `student123`

## 🛠️ Customizing the Seed Data

### To modify the seed data:

1. **Edit `seed.js` file**
2. **Modify the data arrays** in the respective functions:
   - `createUsers()` - Add/modify users
   - `createStudents()` - Modify student details
   - `createFaculty()` - Change faculty information
   - `createAssignments()` - Add more assignments
   - `createGrades()` - Adjust grade ranges
   - `createAttendance()` - Modify attendance patterns
   - `createComplaints()` - Add different complaint types
   - `createAnnouncements()` - Create custom announcements

### Example: Adding more students
```javascript
// In createUsers() function, add more student entries:
{
    username: 'student6',
    email: 'new.student@silveroakuni.ac.in',
    password: 'student123',
    firstName: 'New',
    lastName: 'Student',
    role: 'student',
    phone: '9876543226'
}
```

## 🔄 Re-seeding the Database

### To clear and re-seed:
```bash
npm run seed
```

The script automatically:
1. Clears all existing data
2. Creates fresh sample data
3. Maintains data relationships

### To seed without clearing existing data:
Modify the `seedDatabase()` function in `seed.js`:
```javascript
// Comment out this line:
// await clearDatabase();
```

## 📋 Verification Checklist

After seeding, verify these items:

- [ ] Can login with default credentials
- [ ] Students see their grades and attendance
- [ ] Faculty can view assigned students
- [ ] Assignments are visible to students
- [ ] Complaints appear in admin/faculty dashboards
- [ ] Announcements are displayed
- [ ] All data relationships are intact

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Duplicate Key Errors**
   - Run `npm run seed` to clear and re-seed
   - Check for unique constraints in models

3. **Memory Issues**
   - Reduce the amount of data being created
   - Process data in smaller batches

4. **Validation Errors**
   - Check model validation rules
   - Ensure all required fields are provided

## 📊 Data Statistics

After successful seeding:
- **Total Users:** 10
- **Total Students:** 5
- **Total Faculty:** 4
- **Total Assignments:** 2
- **Total Grades:** 20
- **Total Attendance Records:** 160
- **Total Complaints:** 4
- **Total Announcements:** 4

## 🎯 Benefits of Seeding

1. **Realistic Testing:** Test with actual data scenarios
2. **Faster Development:** No need to manually create test data
3. **Consistent Environment:** Same data across different setups
4. **Feature Testing:** Verify all features work with sample data
5. **Demo Ready:** Perfect for demonstrations and presentations

## 🔧 Advanced Seeding Options

### Environment-specific seeding:
```javascript
// In seed.js, add environment checks:
if (process.env.NODE_ENV === 'development') {
    // Create more test data
} else if (process.env.NODE_ENV === 'production') {
    // Create minimal essential data
}
```

### Selective seeding:
```javascript
// Seed only specific collections:
async function seedSpecific() {
    await createUsers();
    await createStudents();
    // Skip other collections
}
```

The database seeding system is now ready to populate your College Management System with comprehensive sample data! 🎉
