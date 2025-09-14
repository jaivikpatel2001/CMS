const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB for seeding');
    seedDatabase();
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data
        await clearDatabase();
        
        // Create only admin user
        const adminUser = await createAdmin();
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Admin User Created: ${adminUser.email}`);
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@silveroakuni.ac.in / admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

async function clearDatabase() {
    console.log('🧹 Clearing existing users...');
    await User.deleteMany({});
}

async function createAdmin() {
    console.log('👤 Creating Admin user...');
    
    const adminData = {
        username: 'admin',
        email: 'admin@silveroakuni.ac.in',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '9876543210'
    };

    const adminUser = new User(adminData);
    await adminUser.save();

    return adminUser;
}
