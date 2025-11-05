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
// (Đây là lúc chúng ta kết nối các chức năng vào)
app.use('/api/crm', require('./routes/crm.routes'));
// app.use('/api/sales', require('./routes/sales.routes')); // (Sẽ làm sau)
// app.use('/api/inventory', require('./routes/inventory.routes')); // (Sẽ làm sau)

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));