import User from '../models/User.js';

const seedSuperAdmin = async () => {
    const email = 'superadmin@sky-nav.net';
    const password = 'Superadmin@123';

    const existing = await User.findOne({ email });
    if (!existing) {
        await User.create({
            fullName: 'Super Admin',
            email,
            password,
            authProvider: 'local',
            role: 'superadmin',
        });
        console.log('✅ Superadmin seeded');
    }
};

export default seedSuperAdmin;
