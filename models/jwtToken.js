const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require('../config/database')

const schema = new Schema({
    _id: mongoose.Types.ObjectId,
    token: {
        type: String,
        required: true
    },
}, { timestamps: true }, { collection: "jwt_tokens" });

// schema.set('toJSON', {
//     virtuals: true,
//     versionKey: false,
//     transform: function(doc, ret) {
//         delete ret._id;
//         // delete ret.password;
//     }
// });

module.exports = mongoose.model('JWTToken', schema);