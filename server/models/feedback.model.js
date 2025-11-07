const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['OPEN', 'RESOLVED', 'CLOSED'], 
        default: 'OPEN' 
    },


    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);