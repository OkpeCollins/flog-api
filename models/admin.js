const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        min: 3,
        max: 30,
        lowercase: true,
        required: true
    },
    notificationToken: {
        type: String,
        default: new mongoose.Types.ObjectId(),
        required: false,
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
}, { timestamps: true }, { collection: "admins" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Admin', schema);