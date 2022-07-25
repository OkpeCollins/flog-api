const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    userId: {
        type: String,
        required: true
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
    riderId: {
        type: String,
        required: false
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
        enum: ["Ongoing", "Accepted", "Completed", "Pending", "Cancelled"],
        required: false,
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        enum: ["Not Paid", "Paid"],
        required: false,
        default: "Not Paid"
    },
    description: {
        type: String,
        required: true
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
    ETA: {
        text: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    distance: {
        text: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    origin: {
        text: {
            type: String,
            required: true
        },
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    },
    destination: {
        text: {
            type: String,
            required: true
        },
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    },
}, { timestamps: true }, { collection: "trips" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Trip', schema);