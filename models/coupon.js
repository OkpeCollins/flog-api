const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    percentage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Coupon", couponSchema);