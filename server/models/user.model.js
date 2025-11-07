const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'], 
        default: 'DealerStaff' 
    }
}, { timestamps: true });

// --- Mã hóa mật khẩu TRƯỚC KHI lưu ---
// (Đây là một "pre-save hook" của Mongoose)
userSchema.pre('save', async function(next) {
    // Chỉ mã hóa nếu mật khẩu được sửa đổi
    if (!this.isModified('password')) {
        return next();
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10); // Tạo "muối"
    this.password = await bcrypt.hash(this.password, salt); // Băm mật khẩu
    next();
});

// --- Thêm phương thức để so sánh mật khẩu ---
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);