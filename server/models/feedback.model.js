const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true }
});

module.exports = mongoose.model('Feedback', feedbackSchema);