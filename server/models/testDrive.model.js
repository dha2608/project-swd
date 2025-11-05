const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testDriveSchema = new Schema({
    schedule: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], 
        default: 'PENDING' 
    },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true } // Quan trọng: Cần model 'Vehicle'
});

module.exports = mongoose.model('TestDrive', testDriveSchema);