const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['GENERAL', 'FEEDBACK', 'COMPLAINT'], 
        default: 'GENERAL' 
    },
    status: { 
        type: String, 
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
        default: 'OPEN' 
    },
    resolution: { type: String },
    resolvedAt: { type: Date },

    dealer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);