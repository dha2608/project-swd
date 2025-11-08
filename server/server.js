const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

const User = require('./models/user.model');
const Vehicle = require('./models/vehicle.model');

dotenv.config({ path: './.env' });

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/crm', require('./routes/crm.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'EVDMS API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use(errorHandler);

const seedAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@evdms.com' });

        if (!adminExists) {
            await User.create({
                name: 'Admin Demo',
                email: 'admin@evdms.com',
                password: '123', // Mật khẩu sẽ tự động được mã hóa (hash) bởi user.model.js
                role: 'Admin'
            });
            console.log('>>> TAO THANH CONG USER DEMO:');
            console.log('>>> Email: admin@evdms.com');
            console.log('>>> Pass:  123');
        } else {
        }
    } catch (error) {
        console.error('Lỗi tạo User Demo:', error.message);
    }
};

const seedDemoVehicle = async () => {
    try {
        const existing = await Vehicle.findOne({ vin: 'VF8DEMO001' });
        if (existing) {
            return;
        }

        let dealerUser = await User.findOne({ email: 'admin@evdms.com' });
        if (!dealerUser) {
            dealerUser = await User.findOne();
        }
        if (!dealerUser) {
            console.warn('Không có người dùng nào để gán làm dealer cho xe demo. Bỏ qua seed xe.');
            return;
        }

        const vehicle = await Vehicle.create({
            model: 'VF8',
            brand: 'VinFast',
            year: new Date().getFullYear(),
            vin: 'VF8DEMO001',
            color: 'White',
            price: 65000,
            batteryCapacity: 90,
            range: 450,
            chargingTime: 30,
            status: 'AVAILABLE',
            dealer: dealerUser._id,
            features: ['ADAS', 'Panoramic sunroof', 'Leather seats'],
            images: [],
            description: 'Xe demo dùng để đặt lịch lái thử.'
        });

        console.log('>>> TẠO THÀNH CÔNG XE DEMO:', vehicle.vin);
    } catch (error) {
        console.error('Lỗi tạo xe Demo:', error.message);
    }
};

const seedAdditionalVehicles = async () => {
    try {
        let dealerUser = await User.findOne({ email: 'admin@evdms.com' });
        if (!dealerUser) dealerUser = await User.findOne();
        if (!dealerUser) {
            console.warn('Không có người dùng để gán làm dealer cho xe bổ sung. Bỏ qua seed thêm.');
            return;
        }

        const vehicles = [
            {
                model: 'Model 3', brand: 'Tesla', vin: 'TESLA-M3-001', color: 'Blue', price: 42000,
                batteryCapacity: 75, range: 500, chargingTime: 25, status: 'AVAILABLE',
                features: ['Autopilot', 'Glass roof'], images: [], description: 'Tesla Model 3 demo.'
            },
            {
                model: 'Mustang Mach-E', brand: 'Ford', vin: 'FORD-MACHE-001', color: 'Red', price: 55000,
                batteryCapacity: 88, range: 490, chargingTime: 30, status: 'AVAILABLE',
                features: ['SYNC', 'Sport mode'], images: [], description: 'Ford Mustang Mach-E demo.'
            },
            {
                model: 'IONIQ 5', brand: 'Hyundai', vin: 'HYUNDAI-IONIQ5-001', color: 'Silver', price: 48000,
                batteryCapacity: 77, range: 480, chargingTime: 18, status: 'AVAILABLE',
                features: ['V2L', 'AR HUD'], images: [], description: 'Hyundai IONIQ 5 demo.'
            },
            {
                model: 'bZ4X', brand: 'Toyota', vin: 'TOYOTA-BZ4X-001', color: 'Black', price: 45000,
                batteryCapacity: 71, range: 410, chargingTime: 28, status: 'AVAILABLE',
                features: ['Toyota Safety Sense'], images: [], description: 'Toyota bZ4X demo.'
            },
            {
                model: 'iX', brand: 'BMW', vin: 'BMW-IX-001', color: 'White', price: 85000,
                batteryCapacity: 111, range: 520, chargingTime: 35, status: 'AVAILABLE',
                features: ['BMW OS 8', 'Air suspension'], images: [], description: 'BMW iX demo.'
            }
        ];

        for (const v of vehicles) {
            const exists = await Vehicle.findOne({ vin: v.vin });
            if (exists) continue;
            await Vehicle.create({
                ...v,
                year: new Date().getFullYear(),
                dealer: dealerUser._id
            });
            console.log('>>> TẠO XE BỔ SUNG:', v.brand, v.model, v.vin);
        }
    } catch (error) {
        console.error('Lỗi seed thêm xe:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 EVDMS Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    
    seedAdminUser();
    seedDemoVehicle();
    seedAdditionalVehicles();
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    console.log('🔄 Closing server...');
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log(`❌ Uncaught Exception: ${err.message}`);
    console.log('🔄 Closing server...');
    server.close(() => {
        process.exit(1);
    });
});