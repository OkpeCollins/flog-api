const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')
const moment = require("moment");

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    riderId: {
        type: String,
        required: false
    },
    destination: {
        text: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        },
        latitude: {
            type: String,
            required: true
        }
    },
    trips: [{
        id: {
            type: String,
            required: false
        }
    }],
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        required: false,
        default: "Active"
    },
    timeOut: {
        type: String,
        required: true
    },
}, { timestamps: true }, { collection: "onlineriders" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});
module.exports = mongoose.model('OnlineRider', schema);