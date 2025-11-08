const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content: { type: String, required: true },
    subject: { type: String },
    type: { 
        type: String, 
        enum: ['GENERAL', 'FEEDBACK', 'COMPLAINT'], 
        default: 'GENERAL' 
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    channel: { type: String, enum: ['IN_PERSON', 'PHONE', 'EMAIL'], default: 'IN_PERSON' },
    status: { 
        type: String, 
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
        default: 'OPEN' 
    },
    resolution: { type: String },
    resolvedAt: { type: Date },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },

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