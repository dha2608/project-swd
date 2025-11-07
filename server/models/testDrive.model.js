const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ánh xạ (map) Class "TestDrive" từ sơ đồ
const testDriveSchema = new Schema({
    // Thuộc tính (Attributes)
    schedule: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], 
        default: 'PENDING' 
    },

    // Quan hệ "groups" (TestDrive thuộc về 1 Customer)
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    
    // Quan hệ "is for" (TestDrive dành cho 1 Vehicle)
    // (Chúng ta định nghĩa quan hệ này, dù chưa code chức năng 1.a)
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', // Giả định có model 'Vehicle'
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('TestDrive', testDriveSchema);