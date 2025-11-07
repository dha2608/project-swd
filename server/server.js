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
app.use(cors()); // Cho phép React App (ở port 3000) gọi vào
app.use(express.json()); // Cho phép server nhận JSON

// --- TẢI CÁC ROUTES (MODULES) CỦA DỰ ÁN ---
app.use('/api/crm', require('./routes/crm.routes'));
// (Các routes khác sẽ được thêm vào đây sau)

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));