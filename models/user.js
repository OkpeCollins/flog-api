const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    mobile: {
        isVerified: {
            type: Boolean,
            default: true
        },
        value: {
            type: String,
            unique: true,
            required: true
        }
    },
    email: {
        isVerified: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            unique: true,
            min: 3,
            max: 30,
            lowercase: true,
            required: true,
            description: "This Email has already been used"
        }
    },
    notificationToken: {
        type: String,
        default: new mongoose.Types.ObjectId(),
        required: false,
    },
    status: {
        type: String,
        enum: ["Online", "Offline", "Blocked", "Active"],
        required: false,
        default: "Active"
    },
    defaultPaymentType: {
        type: String,
        enum: ["Cash", "Card"],
        required: false,
        default: "Cash"
    },
    profilePicture: {
        mimeType: {
            type: String,
            required: false
        },
        value: {
            type: String,
            required: false
        }
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
    coupon: {
        active:{
            type: Boolean,
            required: false
        },
        code: {
            type: String,
            required: false
        },
        discount: {
            type: String,
            required: false
        },
    }
}, {
    timestamps: true
}, {
    collection: "users"
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('User', schema);