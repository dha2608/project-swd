const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Tên là bắt buộc'],
        trim: true,
        maxlength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    email: { 
        type: String, 
        required: [true, 'Email là bắt buộc'], 
        unique: true, 
        index: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: { 
        type: String, 
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    role: { 
        type: String, 
        enum: {
            values: ['DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'],
            message: 'Vai trò không hợp lệ'
        }, 
        default: 'DealerStaff' 
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    dealerCode: {
        type: String,
        trim: true,
        uppercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    permissions: [{
        type: String,
        enum: ['VIEW_CUSTOMERS', 'MANAGE_CUSTOMERS', 'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'VIEW_REPORTS', 'MANAGE_USERS']
    }]
}, { 
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds); // Tạo "muối"
    this.password = await bcrypt.hash(this.password, salt); // Băm mật khẩu
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);