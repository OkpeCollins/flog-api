const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    id: {
        type: String,
        unique: true,
    },
    twilio: {
        ACCOUNTSID: {
            type: String,
            required: false,
        },
        SERVICE_SID: {
            type: String,
            required: false,
        },
        AUTHTOKEN: {
            type: String,
            required: false,
        },
        CHANNEL: {
            type: String,
            required: false,
        }
    },
    googgleMap: {
        API: {
            type: String,
            required: false,
        }
    },
    trip: {
        pricePerKilometer: {
            type: String,
            required: false,
        },
        fixedPrice: {
            type: String,
            required: false,
        },
    },
    account: {
        name: {
            type: String,
            required: false,
        },
        number: {
            type: String,
            required: false,
        },
        bank: {
            type: String,
            required: false,
        },
    },
    payment: {
        publicKey: {
            type: String,
            required: false,
        },
        secretKey: {
            type: String,
            required: false,
        },
        encryptionKey: {
            type: String,
            required: false,
        },
        currency: {
            type: String,
            required: false,
        },
    },
}, { timestamps: true }, { collection: "settings" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Settings', schema);