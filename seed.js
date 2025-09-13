const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Assignment = require('./models/Assignment');
const Grade = require('./models/Grade');
const Attendance = require('./models/Attendance');
const Complaint = require('./models/Complaint');
const Announcement = require('./models/Announcement');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB for seeding');
    seedDatabase();
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data
        await clearDatabase();
        
        // Create users
        const users = await createUsers();
        
        // Create students
        const students = await createStudents(users);
        
        // Create faculty
        const faculty = await createFaculty(users);
        
        // Create assignments
        const assignments = await createAssignments(faculty, students);
        
        // Create grades
        await createGrades(students, faculty);
        
        // Create attendance records
        await createAttendance(students, faculty);
        
        // Create complaints
        await createComplaints(students);
        
        // Create announcements
        await createAnnouncements(faculty, users);
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Students: ${students.length}`);
        console.log(`- Faculty: ${faculty.length}`);
        console.log(`- Assignments: ${assignments.length}`);
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@silveroakuni.ac.in / admin123');
        console.log('Faculty: 12345@silveroakuni.ac.in / faculty123');
        console.log('Student: 1234567890123@silveroakuni.ac.in / student123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Assignment.deleteMany({});
    await Grade.deleteMany({});
    await Attendance.deleteMany({});
    await Complaint.deleteMany({});
    await Announcement.deleteMany({});
}

async function createUsers() {
    console.log('👥 Creating users...');
    
    const users = [
        // Admin users
        {
            username: 'admin',
            email: 'admin@silveroakuni.ac.in',
            password: 'admin123',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            phone: '9876543210'
        },
        
        // Faculty users
        {
            username: 'faculty1',
            email: '12345@silveroakuni.ac.in',
            password: 'faculty123',
            firstName: 'Vedrucha',
            lastName: 'Pandya',
            role: 'faculty',
            phone: '9876543211'
        },
        {
            username: 'faculty2',
            email: '12346@silveroakuni.ac.in',
            password: 'faculty123',
            firstName: 'Krupa',
            lastName: 'Soni',
            role: 'faculty',
            phone: '9876543212'
        },
        {
            username: 'faculty3',
            email: '12347@silveroakuni.ac.in',
            password: 'faculty123',
            firstName: 'Manav',
            lastName: 'Thakar',
            role: 'faculty',
            phone: '9876543213'
        },
        {
            username: 'faculty4',
            email: '12348@silveroakuni.ac.in',
            password: 'faculty123',
            firstName: 'Moksha',
            lastName: 'Patel',
            role: 'faculty',
            phone: '9876543214'
        },
        
        // Student users
        {
            username: 'student1',
            email: '1234567890123@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Divy',
            lastName: 'Patel',
            role: 'student',
            phone: '9876543221'
        },
        {
            username: 'student2',
            email: '1234567890124@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Raj',
            lastName: 'Shah',
            role: 'student',
            phone: '9876543222'
        },
        {
            username: 'student3',
            email: '1234567890125@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Priya',
            lastName: 'Mehta',
            role: 'student',
            phone: '9876543223'
        },
        {
            username: 'student4',
            email: '1234567890126@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Arjun',
            lastName: 'Desai',
            role: 'student',
            phone: '9876543224'
        },
        {
            username: 'student5',
            email: '1234567890127@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Kavya',
            lastName: 'Joshi',
            role: 'student',
            phone: '9876543225'
        }
    ];
    
    const createdUsers = [];
    for (const userData of users) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
    }
    
    return createdUsers;
}

async function createStudents(users) {
    console.log('🎓 Creating students...');
    
    const studentUsers = users.filter(user => user.role === 'student');
    const students = [];
    
    for (let i = 0; i < studentUsers.length; i++) {
        const user = studentUsers[i];
        const enrollmentNumber = `C${String(i + 1).padStart(6, '0')}`;
        
        const student = new Student({
            userId: user._id,
            enrollmentNumber,
            program: 'Diploma in IT',
            year: 3,
            semester: 5,
            department: 'Information Technology',
            subjects: [
                {
                    subjectCode: 'WT',
                    subjectName: 'Web Technology',
                    credits: 4
                },
                {
                    subjectCode: 'AJP',
                    subjectName: 'Advanced Java Programming',
                    credits: 4
                },
                {
                    subjectCode: 'MT',
                    subjectName: 'Mobile Technology',
                    credits: 4
                },
                {
                    subjectCode: 'BPP',
                    subjectName: 'Basics of Python Programming',
                    credits: 3
                }
            ],
            fees: {
                semesterFees: 20000,
                status: 'paid',
                lastPaymentDate: new Date('2024-08-15'),
                nextPaymentDue: new Date('2025-01-15')
            },
            emergencyContact: {
                name: `${user.firstName} Emergency Contact`,
                relationship: 'Parent',
                phone: '9876543000'
            },
            address: {
                street: '123 Main Street',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pincode: '380001'
            }
        });
        
        await student.save();
        students.push(student);
    }
    
    return students;
}

async function createFaculty(users) {
    console.log('👨‍🏫 Creating faculty...');
    
    const facultyUsers = users.filter(user => user.role === 'faculty');
    const faculty = [];
    
    const facultyData = [
        {
            employeeId: 'F001',
            department: 'Information Technology',
            designation: 'Assistant Professor',
            specialization: 'Web Development',
            qualification: 'M.Tech',
            experience: 5,
            subjects: [
                { subjectCode: 'WT', subjectName: 'Web Technology', semester: 5, year: 3, credits: 4 },
                { subjectCode: 'AJP', subjectName: 'Advanced Java Programming', semester: 5, year: 3, credits: 4 }
            ],
            classes: [
                { subjectCode: 'WT', day: 'Monday', startTime: '11:00', endTime: '12:40', room: 'D-405/B' },
                { subjectCode: 'AJP', day: 'Tuesday', startTime: '11:00', endTime: '12:40', room: 'D-204' }
            ],
            salary: { basic: 60000, allowances: 15000, total: 75000 },
            joiningDate: new Date('2020-07-01')
        },
        {
            employeeId: 'F002',
            department: 'Information Technology',
            designation: 'Lecturer',
            specialization: 'Mobile Development',
            qualification: 'M.Tech',
            experience: 3,
            subjects: [
                { subjectCode: 'MT', subjectName: 'Mobile Technology', semester: 5, year: 3, credits: 4 }
            ],
            classes: [
                { subjectCode: 'MT', day: 'Monday', startTime: '01:10', endTime: '02:50', room: 'D-405/B' }
            ],
            salary: { basic: 50000, allowances: 10000, total: 60000 },
            joiningDate: new Date('2021-07-01')
        },
        {
            employeeId: 'F003',
            department: 'Information Technology',
            designation: 'Lecturer',
            specialization: 'Python Programming',
            qualification: 'M.Tech',
            experience: 4,
            subjects: [
                { subjectCode: 'BPP', subjectName: 'Basics of Python Programming', semester: 5, year: 3, credits: 3 }
            ],
            classes: [
                { subjectCode: 'BPP', day: 'Thursday', startTime: '03:50', endTime: '04:40', room: 'D-204' }
            ],
            salary: { basic: 55000, allowances: 12000, total: 67000 },
            joiningDate: new Date('2020-08-01')
        },
        {
            employeeId: 'F004',
            department: 'Information Technology',
            designation: 'Assistant Professor',
            specialization: 'Database Systems',
            qualification: 'M.Tech',
            experience: 6,
            subjects: [
                { subjectCode: 'DBMS', subjectName: 'Database Management System', semester: 5, year: 3, credits: 4 }
            ],
            classes: [
                { subjectCode: 'DBMS', day: 'Wednesday', startTime: '11:00', endTime: '12:40', room: 'D-204' }
            ],
            salary: { basic: 65000, allowances: 15000, total: 80000 },
            joiningDate: new Date('2019-07-01')
        }
    ];
    
    for (let i = 0; i < facultyUsers.length; i++) {
        const user = facultyUsers[i];
        const data = facultyData[i] || facultyData[0];
        
        const facultyMember = new Faculty({
            userId: user._id,
            ...data
        });
        
        await facultyMember.save();
        faculty.push(facultyMember);
    }
    
    return faculty;
}

async function createAssignments(faculty, students) {
    console.log('📝 Creating assignments...');
    
    const assignments = [];
    
    // Assignment 1: Web Technology
    const wtFaculty = faculty.find(f => f.subjects.some(s => s.subjectCode === 'WT'));
    if (wtFaculty) {
        const assignment1 = new Assignment({
            title: 'PBL-1(Problem Based Learning)',
            description: 'Create a responsive website using HTML, CSS, and JavaScript for a local business.',
            subjectCode: 'WT',
            subjectName: 'Web Technology',
            facultyId: wtFaculty._id,
            assignedTo: students.map(student => ({
                studentId: student._id,
                enrollmentNumber: student.enrollmentNumber
            })),
            dueDate: new Date('2025-03-18'),
            maxMarks: 100,
            instructions: 'Submit a complete website with at least 5 pages, responsive design, and interactive features.',
            status: 'active'
        });
        
        await assignment1.save();
        assignments.push(assignment1);
    }
    
    // Assignment 2: Java Programming
    const ajpFaculty = faculty.find(f => f.subjects.some(s => s.subjectCode === 'AJP'));
    if (ajpFaculty) {
        const assignment2 = new Assignment({
            title: 'WT-Assignment 1',
            description: 'Develop a Java application with GUI using Swing or JavaFX.',
            subjectCode: 'AJP',
            subjectName: 'Advanced Java Programming',
            facultyId: ajpFaculty._id,
            assignedTo: students.map(student => ({
                studentId: student._id,
                enrollmentNumber: student.enrollmentNumber
            })),
            dueDate: new Date('2025-08-30'),
            maxMarks: 100,
            instructions: 'Create a desktop application with database connectivity and user authentication.',
            status: 'active'
        });
        
        await assignment2.save();
        assignments.push(assignment2);
    }
    
    return assignments;
}

async function createGrades(students, faculty) {
    console.log('📊 Creating grades...');
    
    const subjects = [
        { code: 'WT', name: 'Web Technology' },
        { code: 'AJP', name: 'Advanced Java Programming' },
        { code: 'MT', name: 'Mobile Technology' },
        { code: 'BPP', name: 'Basics of Python Programming' }
    ];
    
    for (const student of students) {
        for (const subject of subjects) {
            const subjectFaculty = faculty.find(f => f.subjects.some(s => s.subjectCode === subject.code));
            if (subjectFaculty) {
                const marks = Math.floor(Math.random() * 40) + 60; // 60-100
                const totalMarks = 100;
                const percentage = Math.round((marks / totalMarks) * 100);
                
                let grade = 'F';
                if (percentage >= 90) grade = 'A+';
                else if (percentage >= 80) grade = 'A';
                else if (percentage >= 70) grade = 'B+';
                else if (percentage >= 60) grade = 'B';
                else if (percentage >= 50) grade = 'C+';
                else if (percentage >= 40) grade = 'C';
                else if (percentage >= 35) grade = 'D';
                
                const gpa = grade === 'A+' ? 10 : grade === 'A' ? 9 : grade === 'B+' ? 8 : 
                           grade === 'B' ? 7 : grade === 'C+' ? 6 : grade === 'C' ? 5 : 
                           grade === 'D' ? 4 : 0;
                
                const gradeRecord = new Grade({
                    studentId: student._id,
                    enrollmentNumber: student.enrollmentNumber,
                    subjectCode: subject.code,
                    subjectName: subject.name,
                    facultyId: subjectFaculty._id,
                    semester: student.semester,
                    year: student.year,
                    examType: 'final',
                    marks: {
                        obtained: marks,
                        total: totalMarks,
                        percentage: percentage
                    },
                    grade: grade,
                    gpa: gpa,
                    examDate: new Date('2024-12-15'),
                    isPassed: grade !== 'F',
                    status: 'published'
                });
                
                await gradeRecord.save();
            }
        }
    }
}

async function createAttendance(students, faculty) {
    console.log('📅 Creating attendance records...');
    
    const subjects = ['WT', 'AJP', 'MT', 'BPP'];
    const dates = [
        new Date('2024-12-01'),
        new Date('2024-12-02'),
        new Date('2024-12-03'),
        new Date('2024-12-04'),
        new Date('2024-12-05'),
        new Date('2024-12-08'),
        new Date('2024-12-09'),
        new Date('2024-12-10')
    ];
    
    for (const student of students) {
        for (const subjectCode of subjects) {
            const subjectFaculty = faculty.find(f => f.subjects.some(s => s.subjectCode === subjectCode));
            if (subjectFaculty) {
                for (const date of dates) {
                    const statuses = ['present', 'present', 'present', 'absent', 'late'];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    
                    const attendance = new Attendance({
                        studentId: student._id,
                        enrollmentNumber: student.enrollmentNumber,
                        subjectCode: subjectCode,
                        subjectName: subjectFaculty.subjects.find(s => s.subjectCode === subjectCode).subjectName,
                        facultyId: subjectFaculty._id,
                        semester: student.semester,
                        year: student.year,
                        date: date,
                        status: status,
                        markedBy: subjectFaculty._id,
                        classTime: {
                            start: '11:00',
                            end: '12:40'
                        },
                        room: 'D-405/B'
                    });
                    
                    await attendance.save();
                }
            }
        }
    }
}

async function createComplaints(students) {
    console.log('📢 Creating complaints...');
    
    const complaints = [
        {
            complaintType: 'infrastructure',
            subject: 'Lab Equipment Issue',
            description: 'The lab equipment in D-405 is not working properly. I am unable to complete my practicals.',
            priority: 'high'
        },
        {
            complaintType: 'infrastructure',
            subject: 'Classroom Ventilation',
            description: 'I have a breathing problem with class D-205. Due to which I can\'t attend lectures. Please help to change lecture location.',
            priority: 'medium'
        },
        {
            complaintType: 'academics',
            subject: 'Assignment Submission',
            description: 'The assignment submission portal is not working properly. Unable to upload files.',
            priority: 'high'
        },
        {
            complaintType: 'faculty',
            subject: 'Lecture Timing',
            description: 'The faculty is not punctual for classes. Classes start 15-20 minutes late regularly.',
            priority: 'low'
        }
    ];
    
    for (let i = 0; i < Math.min(complaints.length, students.length); i++) {
        const student = students[i];
        const complaintData = complaints[i];
        
        const complaint = new Complaint({
            studentId: student._id,
            enrollmentNumber: student.enrollmentNumber,
            studentName: `${student.userId.firstName} ${student.userId.lastName}`,
            department: student.department,
            ...complaintData,
            status: 'submitted'
        });
        
        await complaint.save();
    }
}

async function createAnnouncements(faculty, users) {
    console.log('📢 Creating announcements...');
    
    const admin = users.find(user => user.role === 'admin');
    
    const announcements = [
        {
            title: 'Midterm Exam Schedule',
            content: 'Midterm examinations will be conducted from December 20-25, 2024. Please check the exam schedule on the notice board.',
            author: {
                userId: admin._id,
                name: `${admin.firstName} ${admin.lastName}`,
                role: 'admin'
            },
            targetAudience: 'students',
            priority: 'high',
            category: 'exam'
        },
        {
            title: 'Library Hours Extended',
            content: 'The library will remain open till 10 PM during exam preparation period. Students are encouraged to utilize the extended hours.',
            author: {
                userId: admin._id,
                name: `${admin.firstName} ${admin.lastName}`,
                role: 'admin'
            },
            targetAudience: 'all',
            priority: 'medium',
            category: 'general'
        },
        {
            title: 'Assignment Submission Deadline',
            content: 'All pending assignments must be submitted by December 15, 2024. Late submissions will not be accepted.',
            author: {
                userId: faculty[0].userId,
                name: `${faculty[0].userId.firstName} ${faculty[0].userId.lastName}`,
                role: 'faculty'
            },
            targetAudience: 'students',
            priority: 'high',
            category: 'academic'
        },
        {
            title: 'Tech Fest 2025 Registration',
            content: 'Registration for Tech Fest 2025 is now open. Students can register for various competitions and workshops.',
            author: {
                userId: admin._id,
                name: `${admin.firstName} ${admin.lastName}`,
                role: 'admin'
            },
            targetAudience: 'students',
            priority: 'medium',
            category: 'event'
        }
    ];
    
    for (const announcementData of announcements) {
        const announcement = new Announcement(announcementData);
        await announcement.save();
    }
}
