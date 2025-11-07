const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Tải cấu hình (biến môi trường)
dotenv.config({ path: './.env' });

// Kết nối tới Database
connectDB();

const app = express();

// Middleware (cho phép CORS và nhận JSON)
app.use(cors());
app.use(express.json());

// --- TẢI CÁC ROUTES (MODULES) CỦA DỰ ÁN ---
app.use('/api/auth', require('./routes/auth.routes')); // <-- THÊM DÒNG NÀY
app.use('/api/crm', require('./routes/crm.routes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));