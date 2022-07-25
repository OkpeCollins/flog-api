const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    companyName: {
        type: String,
        required: true,
        min: 3,
        max: 30
    },
    mobile: {
        isVerified: { type: Boolean, default: false },
        value: {
            type: String,
            unique: true,
            required: true
        }
    },
    email: {
        isVerified: { type: Boolean, default: false },
        value: {
            type: String,
            unique: true,
            min: 3,
            max: 50,
            lowercase: true,
            required: true
        }
    },
    profilePicture: {
        mimeType: { type: String, required: false },
        value: { type: String, required: false }
    },
    notificationToken: {
        type: String,
        default: new mongoose.Types.ObjectId(),
        required: false,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Blocked"],
        required: false,
        default: "Pending"
    },
    password: {
        salt: {
            type: String,
            required: true
        },
        hash: {
            type: String,
            required: true
        },
    },
    accountDetails: {
        accountName: {
            type: String,
            required: false
        },
        bankName: {
            type: String,
            required: false
        },
        accountNumber: {
            type: String,
            required: false
        },
    },
    city: {
        type: String,
        required: true,
    },
    RGNumber: {
        type: String,
        required: true,
    },
    bikes: {
        type: Number,
        required: false
    }
}, { timestamps: true }, { collection: "fleets" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Fleet', schema);