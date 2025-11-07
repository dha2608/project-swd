const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ánh xạ (map) Class "Feedback" từ sơ đồ
const feedbackSchema = new Schema({
    // Thuộc tính (Attributes)
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['OPEN', 'RESOLVED', 'CLOSED'], 
        default: 'OPEN' 
    },

    // Quan hệ "groups" (Feedback thuộc về 1 Customer)
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);