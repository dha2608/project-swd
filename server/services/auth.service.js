const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

async function registerUser(name, email, password, role = 'DealerStaff') {
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('Email đã được đăng ký');
        }

        const user = await User.create({
            name,
            email,
            password,
            role 
        });

        if (user) {
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                token: generateToken(user._id),
            };
        } else {
            throw new Error('Dữ liệu người dùng không hợp lệ');
        }
    } catch (error) {
        throw error;
    }
}

async function loginUser(email, password) {
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            user.lastLogin = new Date();
            await user.save();

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                token: generateToken(user._id),
            };
        } else {
            throw new Error('Email hoặc Mật khẩu không đúng');
        }
    } catch (error) {
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        return user;
    } catch (error) {
        throw error;
    }
}

async function updateUser(userId, updateData) {
    try {
        delete updateData.password;
        delete updateData.email; // Email không được thay đổi

        const user = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        return user;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    updateUser
};