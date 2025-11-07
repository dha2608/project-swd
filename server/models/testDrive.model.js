const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testDriveSchema = new Schema({
    schedule: { 
        type: Date, 
        required: true,

        validate: {
            validator: function(value) {

                return value > (Date.now() + 60000); 
            },
            message: 'Ngày hẹn lái thử phải là một ngày trong tương lai.'
        }
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], 
        default: 'PENDING' 
    },
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    vehicle: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: true 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('TestDrive', testDriveSchema);