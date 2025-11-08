const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({

    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String },

    dealer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },


    testDrives: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'TestDrive' 
    }],
    
    feedbacks: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Feedback'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);