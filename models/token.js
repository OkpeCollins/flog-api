const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    userId: {
        type: String,
        required: true
    },
    default: { type: Boolean, default: false },
    cardId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    first_6digits: {
        type: String,
        required: true
    },
    last_4digits: {
        type: String,
        required: true
    },
    expiry: {
        type: String,
        required: true
    },
}, { timestamps: true }, { collection: "tokens" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Token', schema);