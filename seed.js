const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');

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
        
        // Create role-specific records
        await createRoleSpecificRecords(users);
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length}`);
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
    await Faculty.deleteMany({});
    await Student.deleteMany({});
}

async function createUsers() {
    console.log('👥 Creating users...');
    
    const users = [
        // Admin user
        {
            username: 'admin',
            email: 'admin@silveroakuni.ac.in',
            password: 'admin123',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            phone: '9876543210'
        },
        
        // Faculty user
        {
            username: 'faculty1',
            email: '12345@silveroakuni.ac.in',
            password: 'faculty123',
            firstName: 'Vedrucha',
            lastName: 'Pandya',
            role: 'faculty',
            phone: '9876543211'
        },
        
        // Student user
        {
            username: 'student1',
            email: '1234567890123@silveroakuni.ac.in',
            password: 'student123',
            firstName: 'Divy',
            lastName: 'Patel',
            role: 'student',
            phone: '9876543221'
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

async function createRoleSpecificRecords(users) {
    console.log('👨‍🏫 Creating role-specific records...');
    
    for (const user of users) {
        if (user.role === 'faculty') {
            const faculty = new Faculty({
                userId: user._id,
                employeeId: 'F001',
                department: 'Information Technology',
                designation: 'Lecturer',
                specialization: 'Computer Science',
                qualification: 'M.Tech',
                experience: 5,
                subjects: [
                    {
                        subjectCode: 'AJP',
                        subjectName: 'Advanced Java Programming',
                        semester: 5,
                        year: 3,
                        credits: 4
                    },
                    {
                        subjectCode: 'BPP',
                        subjectName: 'Basic Of Python Programming',
                        semester: 5,
                        year: 3,
                        credits: 3
                    }
                ],
                classes: [
                    {
                        subjectCode: 'AJP',
                        day: 'Monday',
                        startTime: '11:00',
                        endTime: '12:40',
                        room: 'D-405/B'
                    },
                    {
                        subjectCode: 'BPP',
                        day: 'Tuesday',
                        startTime: '01:10',
                        endTime: '02:50',
                        room: 'D-405/B'
                    }
                ],
                salary: {
                    basic: 50000,
                    allowances: 10000,
                    total: 60000
                },
                joiningDate: new Date('2020-01-01'),
                isActive: true
            });
            await faculty.save();
            console.log(`✅ Created faculty record for ${user.firstName} ${user.lastName}`);
        } else if (user.role === 'student') {
            const student = new Student({
                userId: user._id,
                enrollmentNumber: 'C000001',
                program: 'Diploma in IT',
                year: 3,
                semester: 5,
                department: 'Information Technology',
                subjects: [
                    {
                        subjectCode: 'AJP',
                        subjectName: 'Advanced Java Programming',
                        facultyId: null, // Will be updated after faculty is created
                        semester: 5,
                        year: 3,
                        credits: 4
                    },
                    {
                        subjectCode: 'BPP',
                        subjectName: 'Basic Of Python Programming',
                        facultyId: null, // Will be updated after faculty is created
                        semester: 5,
                        year: 3,
                        credits: 3
                    }
                ],
                fees: {
                    semesterFees: 20000,
                    status: 'paid',
                    nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                address: {
                    street: '123 Main Street',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    pincode: '380001',
                    country: 'India'
                },
                emergencyContact: {
                    name: 'Emergency Contact',
                    relationship: 'Parent',
                    phone: '9876543210'
                },
                isActive: true
            });
            await student.save();
            console.log(`✅ Created student record for ${user.firstName} ${user.lastName}`);
        }
    }
    
    // Update student records with faculty IDs
    const faculty = await Faculty.findOne({ employeeId: 'F001' });
    if (faculty) {
        await Student.updateMany(
            { 'subjects.subjectCode': { $in: ['AJP', 'BPP'] } },
            { $set: { 'subjects.$[elem].facultyId': faculty._id } },
            { arrayFilters: [{ 'elem.subjectCode': { $in: ['AJP', 'BPP'] } }] }
        );
        console.log('✅ Updated student records with faculty assignments');
    }
}

