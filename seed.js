const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

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

