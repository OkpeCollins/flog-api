const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    tripId: {
        type: String,
        required: false
    },
    messages: [{
        _id: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            _id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        },
    }]
}, { timestamps: true }, { collection: "messages" });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

module.exports = mongoose.model('Message', schema);