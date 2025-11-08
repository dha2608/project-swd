const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    model: { 
        type: String, 
        required: true,
        trim: true
    },
    brand: { 
        type: String, 
        required: true,
        trim: true
    },
    year: { 
        type: Number, 
        required: true,
        min: 2020,
        max: new Date().getFullYear() + 2
    },
    vin: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        uppercase: true
    },
    color: { 
        type: String, 
        required: true,
        trim: true
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    batteryCapacity: { 
        type: Number, 
        required: true,
        min: 0
    },
    range: { 
        type: Number, 
        required: true,
        min: 0
    },
    chargingTime: { 
        type: Number, 
        required: true,
        min: 0
    },
    status: { 
        type: String, 
        enum: ['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE'], 
        default: 'AVAILABLE' 
    },
    dealer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    features: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, { 
    timestamps: true 
});

vehicleSchema.index({ model: 1, brand: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ dealer: 1 });
vehicleSchema.index({ price: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);