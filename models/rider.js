const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../config/database')

const riderSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    fullName: {
        type: String,
        required: true,
        min: 3,
        max: 30
    },
    fleetOwnerData: {
        fleetOwn: {
            type: Boolean,
            default: false
        },
        fleetOwnerId: {
            type: String,
            required: false
        }
    },
    mobile: {
        isVerified: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            unique: true,
            required: true
        }
    },
    status: {
        trip: {
            type: String,
            enum: ["Online", "Offline"],
            required: false,
            default: "Offline"
        },
        account: {
            type: String,
            enum: ["Pending", "Approved", "Blocked", "Deleted"],
            required: false,
            default: "Pending"
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
            required: true
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
    notificationToken: {
        type: String,
        default: new mongoose.Types.ObjectId(),
        required: false,
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
    guarantor: {
        name: {
            type: String,
            required: false
        },
        mobile: {
            type: String,
            required: false
        },
        occupation: {
            type: String,
            required: false
        },
        relationship: {
            type: String,
            required: false
        },
        photo: {
            mimeType: {
                type: String,
                required: false
            },
            value: {
                type: String,
                required: false
            }
        },
        address: {
            type: String,
            required: false
        },
    },
    bike: {
        bikeManufacturer: {
            type: String,
            required: true,
            min: 3,
            max: 30
        },
        bikeType: {
            type: String,
            required: true,
            min: 3,
            max: 30
        },
        bikeColor: {
            type: String,
            required: true
        },
        bikePaper: {
            mimeType: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        },
        licensePlate: {
            type: String,
            required: true
        },
        riderDriverLicense: {
            type: String,
            required: true
        },
        riderCardDetails: {
            year: {
                type: String,
                required: true
            },
            month: {
                type: String,
                required: true
            },
            day: {
                type: String,
                required: true
            }
        },
        riderCard: {
            mimeType: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        },
        localGovernmentPaper: {
            mimeType: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        },
    },
    accountDetails: {
        accountName: {
            type: String,
            required: true
        },
        accountNumber: {
            type: Number,
            required: true
        },
        bankName: {
            type: String,
            required: true
        }
    },
}, {
    timestamps: true
}, {
    collection: "riders"
});

riderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // delete ret._id;
        // delete ret.password;
    }
});

riderSchema.method.comparepassword = function (password, callBack) {

}



module.exports = mongoose.model('Rider', riderSchema);