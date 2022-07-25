const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,    
    tripId: {
        type: String,
        required: true
    },
    fleetOwnerId:{
        type: String,
        required: false
    },
    userData: {
        id: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        mobile: {
            type: String,
            required: false
        },
        profilePicture: {
            mimeType: { type: String, required: false },
            value: { type: String, required: false }
        },
    },
    riderData: {
        id: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        mobile: {
            type: String,
            required: false
        },
        profilePicture: {
            mimeType: { type: String, required: false },
            value: { type: String, required: false }
        },
    },
    rate: {
        value: {
            type: Array,
            required: false,
            value: []
        },
        digit: {
            type: String,
            required: false
        },
        text: {
            type: String,
            required: false
        },
    },
    status: {
        type: String,
        enum: ["Ongoing", "Completed"],
        required: false,
        default: "Ongoing"
    },
    paymentStatus: {
        type: String,
        enum: ["Not Paid", "Paid"],
        required: false,
        default: "Not Paid"
    },
    price: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        enum: ["Cash", "Card"],
        required: true
    },
}, { timestamps: true }, { collection: "transactions" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Transaction', schema);