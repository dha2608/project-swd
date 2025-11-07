const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ánh xạ (map) Class "Customer" từ sơ đồ
const customerSchema = new Schema({
    // Thuộc tính (Attributes)
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String },

    // Quan hệ Composition (thoi đặc "groups")
    // "Một Customer sở hữu (1) nhiều TestDrive (*)"
    testDrives: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'TestDrive' // Tham chiếu đến model TestDrive
    }],
    
    // "Một Customer sở hữu (1) nhiều Feedback (*)"
    feedbacks: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Feedback' // Tham chiếu đến model Feedback
    }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);