require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');

async function seedDealerStaff() {
  try {
    await connectDB();

    const staffList = [
      {
        name: 'Dealer Staff 1',
        email: 'staff1@dealer.com',
        password: 'Password123!',
        role: 'DealerStaff',
        phone: '0901234567',
        dealerCode: 'DLR001',
        permissions: ['VIEW_CUSTOMERS', 'MANAGE_CUSTOMERS', 'VIEW_INVENTORY']
      },
      {
        name: 'Dealer Staff 2',
        email: 'staff2@dealer.com',
        password: 'Password123!',
        role: 'DealerStaff',
        phone: '0907654321',
        dealerCode: 'DLR001',
        permissions: ['VIEW_CUSTOMERS', 'VIEW_INVENTORY']
      }
    ];

    for (const staff of staffList) {
      const exists = await User.findOne({ email: staff.email });
      if (exists) {
        console.log(`[seed] User already exists: ${staff.email}`);
        continue;
      }
      const user = new User(staff);
      await user.save();
      console.log(`[seed] Created DealerStaff: ${staff.email}`);
    }

    await mongoose.connection.close();
    console.log('[seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exit(1);
  }
}

seedDealerStaff();