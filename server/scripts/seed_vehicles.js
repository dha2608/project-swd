require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const Vehicle = require('../models/vehicle.model');

async function seedVehicles() {
  try {
    await connectDB();

    // Pick existing DealerStaff accounts to own demo vehicles
    const dealer1 = await User.findOne({ email: 'staff1@dealer.com' });
    const dealer2 = await User.findOne({ email: 'staff2@dealer.com' });
    if (!dealer1) {
      throw new Error('DealerStaff (staff1) not found. Please run npm run seed:staff first.');
    }

    const vehicles = [
      {
        brand: 'VINFAST',
        model: 'VF8',
        year: new Date().getFullYear(),
        vin: 'VF8-DEMO-001',
        color: 'White',
        price: 890000000,
        batteryCapacity: 90,
        range: 420,
        chargingTime: 30,
        status: 'AVAILABLE',
        dealer: dealer1._id,
        features: ['ADAS', 'Panoramic Sunroof'],
        images: [],
        description: 'VF8 demo vehicle for test drives.'
      },
      {
        brand: 'VINFAST',
        model: 'VF9',
        year: new Date().getFullYear(),
        vin: 'VF9-DEMO-001',
        color: 'Black',
        price: 1290000000,
        batteryCapacity: 100,
        range: 500,
        chargingTime: 35,
        status: 'AVAILABLE',
        dealer: dealer1._id,
        features: ['Level 2 Autonomy', '360 Camera'],
        images: [],
        description: 'VF9 demo vehicle for test drives.'
      },
      // Vehicles for staff2 if available
      ...(dealer2 ? [
        {
          brand: 'VINFAST',
          model: 'VF8',
          year: new Date().getFullYear(),
          vin: 'VF8-DEMO-002',
          color: 'Silver',
          price: 900000000,
          batteryCapacity: 90,
          range: 420,
          chargingTime: 30,
          status: 'AVAILABLE',
          dealer: dealer2._id,
          features: ['ADAS', 'Panoramic Sunroof'],
          images: [],
          description: 'VF8 demo vehicle for test drives (staff2).'
        },
        {
          brand: 'VINFAST',
          model: 'VF9',
          year: new Date().getFullYear(),
          vin: 'VF9-DEMO-002',
          color: 'Blue',
          price: 1300000000,
          batteryCapacity: 100,
          range: 500,
          chargingTime: 35,
          status: 'AVAILABLE',
          dealer: dealer2._id,
          features: ['Level 2 Autonomy', '360 Camera'],
          images: [],
          description: 'VF9 demo vehicle for test drives (staff2).'
        }
      ] : [])
    ];

    for (const v of vehicles) {
      const exists = await Vehicle.findOne({ vin: v.vin });
      if (exists) {
        console.log(`[seed] Vehicle already exists: ${v.vin}`);
        continue;
      }
      const created = new Vehicle(v);
      await created.save();
      console.log(`[seed] Created vehicle: ${v.brand} ${v.model} (${v.vin})`);
    }

    await mongoose.connection.close();
    console.log('[seed] Vehicles seeding done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exit(1);
  }
}

seedVehicles();