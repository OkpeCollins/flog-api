const {
    check,
    validationResult
} = require('express-validator');
const Fleet = require('../models/fleet');
const Rider = require('../models/rider');
const User = require('../models/user');
const Trip = require('../models/trip');
const Transaction = require('../models/transaction');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.SECRET
const crypto = require('crypto');
const ejs = require('ejs');
const resetPassword = require("../utils/resetPassword");
const newAccount = require("../utils/newAccount");

exports.create = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })

        } else {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        res.status(403).json({
                            message: err,
                        })
                    } else {
                        fleet = new Fleet({
                            _id: new mongoose.Types.ObjectId(),
                            companyName: req.body.companyName,
                            mobile: {
                                value: req.body.mobile
                            },
                            email: {
                                value: req.body.email
                            },
                            password: {
                                salt: salt,
                                hash: hash
                            },
                            city: req.body.city,
                            accountDetails: {
                                accountName: req.body.accountName,
                                accountNumber: req.body.accountNumber,
                                bankName: req.body.bankName
                            },
                            RGNumber: req.body.RGNumber,
                        })
                        Fleet.exists({
                            "email.value": req.body.email
                        }, function (err, result) {
                            if (!result) {
                                Fleet.exists({
                                    "mobile.value": req.body.mobile
                                }, function (err, result) {
                                    if (!result) {
                                        fleet.save()
                                            .then(async result => {
                                                await newAccount(result.email.value, result.companyName, 4)
                                                res.status(201).json({
                                                    message: "saved successfully ",
                                                    response: result
                                                })
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    message: err
                                                });
                                            })
                                    } else {
                                        res.status(409).json({
                                            message: "Phone number already exist"
                                        })
                                    }
                                })
                            } else {
                                res.status(409).json({
                                    message: "email already exist"
                                })
                            }
                        })
                    }
                });
            });
        }
    } catch (error) {
        res.status(403).json({
            message: error
        })
    }
}

exports.checkUniqueMobile = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            Fleet.exists({
                "mobile.value": req.body.mobile
            }, function (err, result) {
                if (!result) {
                    res.status(201).json({
                        message: "Phone number not exist",
                        response: result
                    })
                } else {
                    res.status(409).json({
                        message: "Phone number already exist",
                        response: result
                    })
                }
            })
        }
    } catch (error) {
        res.status(403).json({
            message: error
        })
    }
}

exports.checkFleet = async function (req, res, next) {
    try {
        await Fleet.findOne({
                _id: req.params.id
            })
            .then(result => {
                if (result != null) {
                    if (result.status == "Pending") {
                        res.status(407).json({
                            response: "Fleet Owner Account is Pending",
                            message: result
                        })
                    } else if (result.status == "Blocked") {
                        res.status(407).json({
                            response: "Fleet Owner Account is Blockd",
                            message: result
                        })
                    } else if (result.status == "Approved") {
                        res.status(201).json({
                            response: "Fleet Owner Account is Approved",
                            message: result
                        })
                    }
                } else {
                    res.status(404).json({
                        response: "Fleet Owner Not Found",
                        message: result
                    })
                }
            })
            .catch(error => {
                res.status(404).json({
                    message: "Fleet Owner not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.checkUniqueEmail = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })

        } else {
            Fleet.exists({
                "email.value": req.body.email
            }, function (err, result) {
                if (!result) {
                    res.status(201).json({
                        message: "Email Not Exist ",
                        response: result
                    })
                } else {
                    res.status(409).json({
                        message: "email already exist"
                    })
                }
            })
        }
    } catch (error) {
        res.status(403).json({
            message: error
        })
    }
}

exports.fetchAll = async function (req, res, next) {
    try {
        await Fleet.find()
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(403).json({
                    message: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.fetchOneById = async function (req, res, next) {
    try {
        await Fleet.find({
                _id: req.params.id
            })
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.fetchOneByEmail = async function (req, res, next) {
    try {
        await Fleet.find({
                "email.value": req.params.email
            })
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.fetchOneByMobile = async function (req, res, next) {
    try {
        await Fleet.find({
                "mobile.value": req.params.mobile
            })
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.deleteOneById = async function (req, res, next) {
    try {
        await Fleet.deleteOne({
                _id: req.params.id
            })
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(403).json({
                    message: error
                })
            })
    } catch (error) {
        //console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.deleteAll = async function (req, res, next) {
    try {
        await Fleet.remove()
            .then(result => {
                res.status(201).json({
                    message: result
                })
            })
            .catch(error => {
                res.status(403).json({
                    message: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.updateProfile = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            await Fleet.updateOne({
                    _id: req.body.fleetId
                }, {
                    $set: {
                        companyName: req.body.companyName,
                        "mobile.value": req.body.mobile,
                        "email.value": req.body.email,
                        "profilePicture.mimeType": req.body.profilePictureMimeType,
                        "profilePicture.value": req.body.profilePictureValue,
                    }
                }, )
                .then(result => {
                    Fleet.findOne({
                            _id: req.body.fleetId
                        })
                        .then(user => {
                            if (user) {
                                var JWTUser = user.email.value;
                                if (user != null) {
                                    jwt.sign({
                                        JWTUser
                                    }, process.env.SECRET, (err, token) => {
                                        if (err) {
                                            res.status(407).json({
                                                message: "JWT Error",
                                                error: err
                                            })
                                        } else {
                                            let salt = crypto.randomBytes(16).toString('base64');
                                            let hash = crypto.createHmac('sha512', salt).update(user.id).digest("base64");
                                            let b = Buffer.from(hash);
                                            let refresh_token = b.toString('base64');
                                            res.status(201).json({
                                                userData: {
                                                    message: "Status Updated Successfully",
                                                    updateMessage: result,
                                                    statusCode: 201,
                                                    data: {
                                                        fleet: {
                                                            id: user.id,
                                                            email: user.email,
                                                            mobile: user.mobile,
                                                            companyName: user.companyName,
                                                            notificationToken: user.notificationToken,
                                                            profilePicture: user.profilePicture,
                                                            profilePictureMimeType: user.profilePicture.mimeType,
                                                        },
                                                        tokens: {
                                                            accessToken: token,
                                                            refreshToken: refresh_token
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.status(407).json({
                                        message: "Fleet Account not Found"
                                    })
                                }
                            } else {
                                res.status(404).json({
                                    message: "Fleet not found"
                                })
                            }
                        })
                        .catch(err => {
                            res.status(404).json({
                                message: err
                            })
                        })
                })
                .catch(error => {
                    if (error.keyPattern["email.value"] > 0) {
                        res.status(422).json({
                            message: "Email Address already exist",
                            response: error.keyPattern
                        })
                    } else if (error.keyPattern["mobile.value"] > 0) {
                        res.status(422).json({
                            message: "Mobile number already exist",
                            response: error.keyPattern
                        })
                    } else {
                        res.status(404).json({
                            message: "error occur",
                            response: error,
                        })
                    }
                })
        }
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.updatePasswordById = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            try {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                        if (err) {
                            res.status(403).json({
                                message: err
                            })
                        } else {
                            Fleet.findOne({
                                    _id: req.body.id
                                })
                                .then(fleet => {
                                    if (fleet != null) {
                                        bcrypt.compare(req.body.currentPassword, fleet.password.hash, function (err, result) {
                                            if (result) {
                                                Fleet.updateOne({
                                                        _id: req.body.id
                                                    }, {
                                                        $set: {
                                                            "password.salt": salt,
                                                            "password.hash": hash
                                                        }
                                                    }, )
                                                    .then(result => {
                                                        res.status(201).json({
                                                            message: "Password Changed Successfully",
                                                            response: result
                                                        })
                                                    })
                                                    .catch(error => {
                                                        res.status(404).json({
                                                            message: "record not found",
                                                            response: error
                                                        })
                                                    })
                                            } else {
                                                res.status(404).json({
                                                    message: "Current Password is wrong",
                                                    response: err
                                                })
                                            }
                                        });
                                    } else {
                                        res.status(404).json({
                                            message: "Fleet not found"
                                        })
                                    }
                                })
                                .catch(err => {
                                    res.status(404).json({
                                        message: err
                                    })
                                })

                        }
                    });
                });
            } catch (error) {
                res.status(407).json({
                    error: error
                })
            }
        }
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.sendCode = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        var settings = await Settings.findOne({
            id: 1
        })
        if (settings != null) {
            try {
                const accountSid = settings.twilio.ACCOUNTSID;
                const authToken = settings.twilio.AUTHTOKEN;
                const client = require('twilio')(accountSid, authToken);
                var mobile = req.body.mobile;
                client.verify.services(settings.twilio.SERVICE_SID)
                    .verifications
                    .create({
                        to: mobile,
                        channel: settings.twilio.CHANNEL
                    })
                    .then(result => {
                        res.send({
                            message: "Code sent successfully",
                            status: result.status
                        })
                    }).catch(err => {
                        res.status(407).json({
                            message: "Code not sent",
                            error: err
                        })
                    });
            } catch (error) {
                res.status(407).json({
                    message: "something went wrong",
                    error: error
                })

            }
        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    }
}

exports.verifyCode = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        var settings = await Settings.findOne({
            id: 1
        })
        if (settings != null) {
            try {
                const accountSid = settings.twilio.ACCOUNTSID;
                const authToken = settings.twilio.AUTHTOKEN;
                const client = require('twilio')(accountSid, authToken);
                var mobile = req.body.mobile
                var code = req.body.code
                await client.verify.services(settings.twilio.SERVICE_SID)
                    .verificationChecks
                    .create({
                        to: mobile,
                        code: code
                    })
                    .then(verification_check => {
                        if (verification_check.status == "approved") {
                            Fleet.updateOne({
                                    email: req.body.email
                                }, {
                                    $set: {
                                        "mobile.isVerified": true
                                    }
                                }, )
                                .then(result => {
                                    if (result) {
                                        res.status(200).json({
                                            message: "Verification approved successfully",
                                            response: verification_check.status
                                        })
                                    } else {
                                        res.status(400).json({
                                            message: "Not successful"
                                        })
                                    }
                                }).catch(err => {
                                    res.status(400).json({
                                        error: err
                                    })
                                })
                        } else {
                            res.status(400).json({
                                message: "Verification not successfully",
                                response: verification_check.status
                            })
                        }
                    }).catch(err => {
                        res.status(407).json({
                            error: err
                        })
                    });
            } catch (error) {
                res.status(407).json({
                    message: "something went wrong",
                    error: error
                })

            }
        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    }
}

exports.isPasswordAndFleetMatch = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            Fleet.findOne({
                    "email.value": req.body.email
                })
                .then(fleet => {
                    if (fleet) {
                        bcrypt.compare(req.body.password, fleet.password.hash, function (err, result) {
                            if (result) {
                                if (fleet.status != "Pending") {
                                    if (fleet.status == "Approved") {
                                        jwt.sign({
                                            fleet
                                        }, process.env.SECRET, (err, token) => {
                                            if (err) {
                                                res.status(407).json({
                                                    message: "JWT Error",
                                                    error: err
                                                })
                                            } else {
                                                let salt = crypto.randomBytes(16).toString('base64');
                                                let hash = crypto.createHmac('sha512', salt).update(fleet.id).digest("base64");
                                                let b = Buffer.from(hash);
                                                let refresh_token = b.toString('base64');
                                                res.status(201).json({
                                                    fleetData: {
                                                        statusCode: 201,
                                                        message: "Login Success",
                                                        data: {
                                                            fleet: {
                                                                id: fleet.id,
                                                                email: fleet.email,
                                                                mobile: fleet.mobile,
                                                                companyName: fleet.companyName,
                                                                notificationToken: fleet.notificationToken,
                                                                profilePicture: fleet.profilePicture,
                                                            },
                                                            tokens: {
                                                                accessToken: token,
                                                                refreshToken: refresh_token
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        res.status(404).json({
                                            message: "Account has been Blocked"
                                        })
                                    }
                                } else {
                                    res.status(404).json({
                                        message: "Account is not yet Approved"
                                    })
                                }
                            } else {
                                res.status(404).json({
                                    message: "Incorrect password"
                                })
                            }
                        });
                    } else {
                        res.status(404).json({
                            message: "User not found"
                        })
                    }
                })
                .catch(err => {
                    res.status(404).json({
                        message: err
                    })
                })
        } catch (error) {
            res.status(407).json({
                error: error
            })
        }
    }
};

exports.createRider = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        res.status(403).json({
                            message: err
                        })
                    } else {
                        rider = new Rider({
                            _id: new mongoose.Types.ObjectId(),
                            fullName: req.body.fullName,
                            fleetOwnerData: {
                                fleetOwn: true,
                                fleetOwnerId: req.body.fleetOwnerId
                            },
                            mobile: {
                                value: req.body.mobile
                            },
                            email: {
                                value: req.body.email
                            },
                            password: {
                                salt: salt,
                                hash: hash
                            },
                            profilePicture: {
                                mimeType: req.body.profilePhotoMimeType,
                                value: req.body.profilePhotoValue
                            },
                            bike: {
                                bikeManufacturer: req.body.bikeManufacturer,
                                bikeType: req.body.bikeType,
                                bikeColor: req.body.bikeColor,
                                bikePaper: {
                                    mimeType: req.body.bikePaperMimeType,
                                    value: req.body.bikePaperValue,
                                },
                                licensePlate: req.body.licensePlate,
                                riderDriverLicense: req.body.riderDriverLicense,
                                localGovernmentPaper: {
                                    mimeType: req.body.localGovernmentPaperMimeType,
                                    value: req.body.localGovernmentPaperValue,
                                },
                                riderCardDetails: {
                                    year: req.body.riderCardYear,
                                    month: req.body.riderCardMonth,
                                    day: req.body.riderCardDay,
                                },
                            },
                            accountDetails: {
                                accountName: "0",
                                accountNumber: "0",
                                bankName: "0"
                            }
                        })
                        // console.log("localGovernmentPaperValue=" + req.body.localGovernmentPaperValue);
                        // console.log("bikePaperValue=" + req.body.bikePaperValue);
                        // console.log("profilePhotoValue=" + req.body.profilePhotoValue);
                        Rider.exists({
                            "email.value": req.body.email
                        }, function (err, result) {
                            if (!result) {
                                Rider.exists({
                                    "mobile.value": req.body.mobile
                                }, function (err, result) {
                                    if (!result) {
                                        rider.save()
                                            .then(result => {
                                                res.status(201).json({
                                                    message: "saved successfully ",
                                                    response: result
                                                })
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    message: err
                                                });
                                            })
                                    } else {
                                        res.status(409).json({
                                            message: "Phone number already exist"
                                        })
                                    }
                                })
                            } else {
                                res.status(409).json({
                                    message: "email already exist"
                                })
                            }
                        })
                    }
                });
            });
        }
    } catch (error) {
        res.status(403).json({
            message: error
        })
    }
}

exports.sendResetPasswordLink = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            await Fleet.findOne({
                    "email.value": req.body.email
                })
                .then(async result => {
                    if (result) {
                        var host = req.get('host');
                        var token = jwt.sign({
                            id: result._id
                        }, jwt_secret, {
                            expiresIn: 3600 // 1 hour
                        });
                        var link = host + "/user-reset-password/" + token
                        await resetPassword(result.email.value, result._id, result.companyName, 4);
                        res.status(201).json({
                            message: "Fleet Owner Found & Link sent",
                            response: link,
                            token: token
                        })
                    } else {
                        res.status(403).json({
                            err: "No Record Found this Email"
                        })
                    }
                })
                .catch(err => {
                    res.status(407).json({
                        message: "Something went wrong",
                        error: err
                    })
                })
        } catch (error) {
            res.status(407).json({
                error: error
            })
        }
    }
};

exports.resetPasswordPage = async function (req, res, next) {
    var token = req.params.token;
    if (token) {
        jwt.verify(token, jwt_secret, function (err, decode) {
            if (err) {
                res.status(407).json({
                    message: err
                })
            } else {
                res.status(201).json({
                    message: token,
                    payload: decode
                })
            }
        })
    } else {
        res.status(407).json({
            message: "token not found"
        })
    }
}

exports.resetPassword = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                    if (err) {
                        res.status(403).json({
                            message: err
                        })
                    } else {
                        Fleet.findOne({
                                _id: req.body.id
                            })
                            .then(fleet => {
                                if (fleet) {
                                    Fleet.updateOne({
                                            _id: req.body.id
                                        }, {
                                            $set: {
                                                "password.salt": salt,
                                                "password.hash": hash
                                            }
                                        }, )
                                        .then(result => {
                                            res.status(201).json({
                                                message: "Password Reset Successfully",
                                                response: result
                                            })
                                        })
                                        .catch(error => {
                                            res.status(404).json({
                                                message: "record not found",
                                                response: error
                                            })
                                        })
                                } else {
                                    res.status(404).json({
                                        message: "Fleet Owner not found"
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(404).json({
                                    message: "Fleet Owner not found",
                                    err: err
                                })
                            })

                    }
                });
            });
        } catch (error) {
            res.status(407).json({
                error: error
            })
        }
    }
}

exports.createTransaction = async function createTransaction(tripId) {
    var trip = await Trip.findOne({
        _id: tripId
    })
    if (trip != null) {
        var rider = await Rider.findOne({
            _id: trip.riderId
        })
        var userData = await User.findOne({
            _id: trip.userId
        })
        if (rider != null && userData != null) {
            if (rider.fleetOwnerData.fleetOwn == true) {
                console.log(rider.fleetOwnerData.fleetOwnerId)
                var fleetOwnerId = rider.fleetOwnerData.fleetOwnerId
            } else {
                var fleetOwnerId = 0;
            }
            new Transaction({
                    _id: new mongoose.Types.ObjectId(),
                    tripId: trip._id,
                    fleetOwnerId: fleetOwnerId,
                    userData: {
                        id: userData._id,
                        name: userData.name,
                        email: userData.email.value,
                        mobile: userData.mobile.value,
                        profilePicture: {
                            mimeType: userData.profilePicture.mimeType,
                            value: userData.profilePicture.value
                        }
                    },
                    riderData: {
                        id: rider._id,
                        name: rider.fullName,
                        email: rider.email.value,
                        mobile: rider.mobile.value,
                        profilePicture: {
                            mimeType: rider.profilePicture.mimeType,
                            value: rider.profilePicture.value
                        }
                    },
                    price: trip.price,
                    paymentType: trip.paymentType
                }).save()
                .then(
                    result => {
                        console.log("Transaction Saved")
                    }
                )
                .catch(error => {
                    console.log(error)
                    console.log("Transaction not Saved")
                })
        } else {
            console.log("Can not save transaction")
            console.log(userData._id)
        }
    } else {
        console.log("Trip Not Found")
    }
}

exports.updateTransactionWithPaid = async function updateTransactionWithPaid(tripId) {
    var trip = await Trip.findOne({
        _id: tripId
    })
    if (trip != null) {
        Transaction.updateOne({
                tripId: trip._id
            }, {
                $set: {
                    status: "Completed",
                    paymentStatus: "Paid",
                }
            })
            .then(result => {
                console.log("Transaction Updated")
            })
            .catch(error => {
                console.log("Transaction Not Updated")
            })
    } else {
        console.log("Trip Not Found")
    }
}

exports.updateTransactionWithNotPaid = async function updateTransactionWithNotPaid(tripId) {
    var trip = await Trip.findOne({
        _id: tripId
    })
    if (trip != null) {
        Transaction.updateOne({
                tripId: trip._id
            }, {
                $set: {
                    status: "Completed",
                    paymentStatus: "Not Paid",
                }
            })
            .then(result => {
                console.log("Transaction Updated")
            })
            .catch(error => {
                console.log("Transaction Not Updated")
            })
    } else {
        console.log("Trip Not Found")
    }
}

exports.homePage = async function (req, res) {
    try {
        var fleetId = req.params.fleetId
        Fleet.findOne({
                _id: fleetId
            })
            .then(async result => {
                if (result != null) {
                    //createTransaction("609465f63cd3af5fb8c70996")
                    //updateTransactionWithPaid("609465f63cd3af5fb8c70996")
                    var totalEarning = 0;
                    var totalEarningQuery = await Transaction.find({
                        fleetOwnerId: result._id,
                        status: "Completed",
                    }).select('price -_id')
                    for (var i = 0; i < totalEarningQuery.length; i++) {
                        totalEarning += parseInt(totalEarningQuery[i].price);
                    }

                    var totalRiders = await Rider.countDocuments({
                        "fleetOwnerData.fleetOwnerId": result._id
                    })

                    var lastFiveRiders = await Rider.find({
                        "fleetOwnerData.fleetOwnerId": result._id
                    }).sort({
                        $natural: -1
                    }).limit(5);

                    var totalRatings = 0;
                    var totalRatingQuery = await Transaction.find({
                        fleetOwnerId: result._id,
                        status: "Completed",
                    }).select('rate.digit -_id')
                    for (var i = 0; i < totalRatingQuery.length; i++) {
                        if (totalRatingQuery[i].rate.digit) {
                            totalRatings += parseInt(totalRatingQuery[i].rate.digit);
                        }
                    }
                    var countTotalRatingQuery = await Transaction.countDocuments({
                        fleetOwnerId: result._id,
                        status: "Completed",
                        "rate.digit": {
                            $gte: `0`
                        }
                    })

                    var totalRating = totalRatings / parseInt(countTotalRatingQuery)

                    let resData = {
                        allDataStat: [{
                                name: 'totalEarning',
                                value: totalEarning,
                            },
                            {
                                name: 'totalRating',
                                value: parseFloat(totalRating).toFixed(2),
                            },
                            {
                                name: 'totalRiders',
                                value: totalRiders,
                            }
                        ],
                        lastFiveRiders: lastFiveRiders,
                    }

                    res.status(201).json(resData)
                } else {
                    res.status(422).json({
                        message: "Fleet Owner not found",
                    })
                }
            })
            .catch(err => {
                res.status(422).json({
                    message: "error",
                    error: err
                })
            })

    } catch (error) {
        res.status(422).json({
            message: "error",
            error: errors
        })
    }
}
exports.allRiders = async function (req, res) {
    try {
        var fleetId = req.params.fleetId
        Fleet.findOne({
                _id: fleetId
            })
            .then(async result => {
                if (result != null) {
                    Rider.find({
                            "fleetOwnerData.fleetOwnerId": result._id
                        }).sort({
                            $natural: -1
                        })
                        .then(
                            riders => {
                                res.status(201).json({
                                    riders: riders,
                                })
                            }
                        )
                        .catch(err => {
                            res.status(422).json({
                                message: "error",
                                error: err
                            })
                        })
                } else {
                    res.status(422).json({
                        message: "Fleet Owner not found",
                    })
                }
            })
            .catch(err => {
                res.status(422).json({
                    message: "error",
                    error: err
                })
            })

    } catch (error) {
        res.status(422).json({
            message: "error",
            error: errors
        })
    }
}

exports.allTransactions = async function (req, res) {
    try {
        Transaction.find({})
            .then(
                transactions => {
                    res.status(201).json({
                        allTransactions: transactions,
                    })
                }
            )
            .catch(err => {
                console.log(err)
                res.status(422).json({
                    message: "error",
                    error: err
                })
            })
    } catch (error) {
        console.log(error)
        res.status(422).json({
            message: "error",
            error: error
        })
    }
}

exports.currentWeekNet = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var curr = new Date();
        var sunday = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
        var monday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toISOString().split('T')[0];
        var tuesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 2)).toISOString().split('T')[0];
        var wednesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 3)).toISOString().split('T')[0];
        var thursday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 4)).toISOString().split('T')[0];
        var friday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6)).toISOString().split('T')[0];
        var sundayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var mondayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var tuesdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var wednesdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var thursdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var fridayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var saturdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')

        var sundayPay = 0;
        var mondayPay = 0;
        var tuesdayPay = 0;
        var wednesdayPay = 0;
        var thursdayPay = 0;
        var fridayPay = 0;
        var saturdayPay = 0;

        for (var i = 0; i < sundayData.length; i++) {
            sundayPay += parseInt(sundayData[i].price);
        }

        for (var i = 0; i < mondayData.length; i++) {
            mondayPay += parseInt(mondayData[i].price);
        }

        for (var i = 0; i < tuesdayData.length; i++) {
            tuesdayPay += parseInt(tuesdayData[i].price);
        }

        for (var i = 0; i < wednesdayData.length; i++) {
            wednesdayPay += parseInt(wednesdayData[i].price);
        }

        for (var i = 0; i < thursdayData.length; i++) {
            thursdayPay += parseInt(thursdayData[i].price);
        }

        for (var i = 0; i < fridayData.length; i++) {
            fridayPay += parseInt(fridayData[i].price);
        }

        for (var i = 0; i < saturdayData.length; i++) {
            saturdayPay += parseInt(saturdayData[i].price);
        }
        var week = sundayPay + mondayPay + tuesdayPay + wednesdayPay + thursdayPay + fridayPay + saturdayPay;
        var data = Array({
            "day": "sunday",
            "earning": parseFloat(sundayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "monday",
            "earning": parseFloat(mondayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "tuesday",
            "earning": parseFloat(tuesdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "wednesday",
            "earning": parseFloat(wednesdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "thursday",
            "earning": parseFloat(thursdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "friday",
            "earning": parseFloat(fridayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "saturday",
            "earning": parseFloat(saturdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        });
        let newData = {
            days: data,
            allDaysEarning: parseFloat(week * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }
        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.previousWeekNet = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        var beforeOneWeek2 = new Date(beforeOneWeek);
        var sunday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay())).toISOString().split('T')[0];
        var monday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 1)).toISOString().split('T')[0];
        var tuesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 2)).toISOString().split('T')[0];
        var wednesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 3)).toISOString().split('T')[0];
        var thursday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 4)).toISOString().split('T')[0];
        var friday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 6)).toISOString().split('T')[0];

        var sundayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var mondayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var tuesdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var wednesdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var thursdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var fridayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var saturdayData = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')

        var sundayPay = 0;
        var mondayPay = 0;
        var tuesdayPay = 0;
        var wednesdayPay = 0;
        var thursdayPay = 0;
        var fridayPay = 0;
        var saturdayPay = 0;

        for (var i = 0; i < sundayData.length; i++) {
            sundayPay += parseInt(sundayData[i].price);
        }

        for (var i = 0; i < mondayData.length; i++) {
            mondayPay += parseInt(mondayData[i].price);
        }

        for (var i = 0; i < tuesdayData.length; i++) {
            tuesdayPay += parseInt(tuesdayData[i].price);
        }

        for (var i = 0; i < wednesdayData.length; i++) {
            wednesdayPay += parseInt(wednesdayData[i].price);
        }

        for (var i = 0; i < thursdayData.length; i++) {
            thursdayPay += parseInt(thursdayData[i].price);
        }

        for (var i = 0; i < fridayData.length; i++) {
            fridayPay += parseInt(fridayData[i].price);
        }

        for (var i = 0; i < saturdayData.length; i++) {
            saturdayPay += parseInt(saturdayData[i].price);
        }

        var week = sundayPay + mondayPay + tuesdayPay + wednesdayPay + thursdayPay + fridayPay + saturdayPay;
        var data = Array({
            "day": "sunday",
            "earning": parseFloat(sundayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "monday",
            "earning": parseFloat(mondayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "tuesday",
            "earning": parseFloat(tuesdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "wednesday",
            "earning": parseFloat(wednesdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "thursday",
            "earning": parseFloat(thursdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "friday",
            "earning": parseFloat(fridayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "saturday",
            "earning": parseFloat(saturdayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        });
        let newData = {
            days: data,
            allDaysEarning: parseFloat(week * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }
        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(407).json({
            response: error
        })
    }
}

exports.threeMonthsNet = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var months = ['January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        var firstMonthName = months[new Date().getMonth()];
        var firstMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), 1)).toISOString().split('T')[0];
        var firstMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0];

        var secondMonthName = months[new Date().getMonth() - 1];
        var secondMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -1)).toISOString().split('T')[0];
        var secondMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0];

        var thirdMonthName = months[new Date().getMonth() - 2];
        var thirdMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -2)).toISOString().split('T')[0];
        var thirdMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 2, 2)).toISOString().split('T')[0];

        var firstMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${firstMonthFirstDay}T00:00:00.000Z`,
                $lt: `${firstMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')

        var firstMonthPay = 0;
        for (var i = 0; i < firstMonth.length; i++) {
            firstMonthPay += parseInt(firstMonth[i].price);
        }

        var secondMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
                $lt: `${secondMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')

        var secondMonthPay = 0;
        for (var i = 0; i < secondMonth.length; i++) {
            secondMonthPay += parseInt(secondMonth[i].price);
        }

        var thirdMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
                $lt: `${thirdMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')

        var thirdMonthPay = 0;
        for (var i = 0; i < thirdMonth.length; i++) {
            thirdMonthPay += parseInt(thirdMonth[i].price);
        }

        var threeMonthPay = firstMonthPay + secondMonthPay + thirdMonthPay;
        var data = [{
                "month": firstMonthName,
                "earning": parseFloat(firstMonthPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            },
            {
                "month": secondMonthName,
                "earning": parseFloat(secondMonthPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            },
            {
                "month": thirdMonthName,
                "earning": parseFloat(thirdMonthPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            }
        ]

        var newData = {
            months: data,
            allthreeMonths: parseFloat(threeMonthPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        }
        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.currentWeekRevenue = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var curr = new Date();
        var sunday = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
        var monday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toISOString().split('T')[0];
        var tuesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 2)).toISOString().split('T')[0];
        var wednesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 3)).toISOString().split('T')[0];
        var thursday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 4)).toISOString().split('T')[0];
        var friday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var sundayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var mondayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var mondayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var tuesdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var tuesdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var wednesdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var wednesdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var thursdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thursdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var fridayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var fridayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var saturdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var saturdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var sundayCashPay = 0;
        var sundayCardPay = 0;

        var mondayCashPay = 0;
        var mondayCardPay = 0;

        var tuesdayCashPay = 0;
        var tuesdayCardPay = 0;

        var wednesdayCashPay = 0;
        var wednesdayCardPay = 0;

        var thursdayCashPay = 0;
        var thursdayCardPay = 0;

        var fridayCashPay = 0;
        var fridayCardPay = 0;

        var saturdayCashPay = 0;
        var saturdayCardPay = 0;

        for (var i = 0; i < sundayCash.length; i++) {
            sundayCashPay += parseInt(sundayCash[i].price);
        }

        for (var i = 0; i < sundayCard.length; i++) {
            sundayCardPay += parseInt(sundayCard[i].price);
        }

        for (var i = 0; i < mondayCash.length; i++) {
            mondayCashPay += parseInt(mondayCash[i].price);
        }

        for (var i = 0; i < mondayCard.length; i++) {
            mondayCardPay += parseInt(mondayCard[i].price);
        }

        for (var i = 0; i < tuesdayCash.length; i++) {
            tuesdayCashPay += parseInt(tuesdayCash[i].price);
        }

        for (var i = 0; i < tuesdayCard.length; i++) {
            tuesdayCardPay += parseInt(tuesdayCard[i].price);
        }

        for (var i = 0; i < wednesdayCash.length; i++) {
            wednesdayCashPay += parseInt(wednesdayCash[i].price);
        }

        for (var i = 0; i < wednesdayCard.length; i++) {
            wednesdayCardPay += parseInt(wednesdayCard[i].price);
        }

        for (var i = 0; i < thursdayCash.length; i++) {
            thursdayCashPay += parseInt(thursdayCash[i].price);
        }

        for (var i = 0; i < thursdayCard.length; i++) {
            thursdayCardPay += parseInt(thursdayCard[i].price);
        }

        for (var i = 0; i < fridayCash.length; i++) {
            fridayCashPay += parseInt(fridayCash[i].price);
        }

        for (var i = 0; i < fridayCard.length; i++) {
            fridayCardPay += parseInt(fridayCard[i].price);
        }

        for (var i = 0; i < saturdayCash.length; i++) {
            saturdayCashPay += parseInt(saturdayCash[i].price);
        }

        for (var i = 0; i < saturdayCard.length; i++) {
            saturdayCardPay += parseInt(saturdayCard[i].price);
        }

        var weekCash = sundayCashPay + mondayCashPay + tuesdayCashPay + wednesdayCashPay + thursdayCashPay + fridayCashPay + saturdayCashPay;
        var weekCard = sundayCardPay + mondayCardPay + tuesdayCardPay + wednesdayCardPay + thursdayCardPay + fridayCardPay + saturdayCardPay;
        var data = Array({
            "day": "sunday",
            "earningCash": sundayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": sundayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "monday",
            "earningCash": mondayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": mondayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "tuesday",
            "earningCash": tuesdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": tuesdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "wednesday",
            "earningCash": wednesdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": wednesdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "thursday",
            "earningCash": thursdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": thursdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "friday",
            "earningCash": fridayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": fridayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "saturday",
            "earningCash": saturdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": saturdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        });

        let newData = {
            revenue: data,
            weekEarningCash: weekCash.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            weekEarningCard: weekCard.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }
        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.previousWeekRevenue = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        var beforeOneWeek2 = new Date(beforeOneWeek);
        var sunday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay())).toISOString().split('T')[0];
        var monday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 1)).toISOString().split('T')[0];
        var tuesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 2)).toISOString().split('T')[0];
        var wednesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 3)).toISOString().split('T')[0];
        var thursday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 4)).toISOString().split('T')[0];
        var friday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var sundayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var mondayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var mondayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var tuesdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var tuesdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var wednesdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var wednesdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var thursdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thursdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var fridayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var fridayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var saturdayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var saturdayCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var sundayCashPay = 0;
        var sundayCardPay = 0;

        var mondayCashPay = 0;
        var mondayCardPay = 0;

        var tuesdayCashPay = 0;
        var tuesdayCardPay = 0;

        var wednesdayCashPay = 0;
        var wednesdayCardPay = 0;

        var thursdayCashPay = 0;
        var thursdayCardPay = 0;

        var fridayCashPay = 0;
        var fridayCardPay = 0;

        var saturdayCashPay = 0;
        var saturdayCardPay = 0;

        for (var i = 0; i < sundayCash.length; i++) {
            sundayCashPay += parseInt(sundayCash[i].price);
        }

        for (var i = 0; i < sundayCard.length; i++) {
            sundayCardPay += parseInt(sundayCard[i].price);
        }

        for (var i = 0; i < mondayCash.length; i++) {
            mondayCashPay += parseInt(mondayCash[i].price);
        }

        for (var i = 0; i < mondayCard.length; i++) {
            mondayCardPay += parseInt(mondayCard[i].price);
        }

        for (var i = 0; i < tuesdayCash.length; i++) {
            tuesdayCashPay += parseInt(tuesdayCash[i].price);
        }

        for (var i = 0; i < tuesdayCard.length; i++) {
            tuesdayCardPay += parseInt(tuesdayCard[i].price);
        }

        for (var i = 0; i < wednesdayCash.length; i++) {
            wednesdayCashPay += parseInt(wednesdayCash[i].price);
        }

        for (var i = 0; i < wednesdayCard.length; i++) {
            wednesdayCardPay += parseInt(wednesdayCard[i].price);
        }

        for (var i = 0; i < thursdayCash.length; i++) {
            thursdayCashPay += parseInt(thursdayCash[i].price);
        }

        for (var i = 0; i < thursdayCard.length; i++) {
            thursdayCardPay += parseInt(thursdayCard[i].price);
        }

        for (var i = 0; i < fridayCash.length; i++) {
            fridayCashPay += parseInt(fridayCash[i].price);
        }

        for (var i = 0; i < fridayCard.length; i++) {
            fridayCardPay += parseInt(fridayCard[i].price);
        }

        for (var i = 0; i < saturdayCash.length; i++) {
            saturdayCashPay += parseInt(saturdayCash[i].price);
        }

        for (var i = 0; i < saturdayCard.length; i++) {
            saturdayCardPay += parseInt(saturdayCard[i].price);
        }


        var weekCash = sundayCashPay + mondayCashPay + tuesdayCashPay + wednesdayCashPay + thursdayCashPay + fridayCashPay + saturdayCashPay;
        var weekCard = sundayCardPay + mondayCardPay + tuesdayCardPay + wednesdayCardPay + thursdayCardPay + fridayCardPay + saturdayCardPay;
        var data = Array({
            "day": "sunday",
            "earningCash": sundayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": sundayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "monday",
            "earningCash": mondayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": mondayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "tuesday",
            "earningCash": tuesdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": tuesdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "wednesday",
            "earningCash": wednesdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": wednesdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "thursday",
            "earningCash": thursdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": thursdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "friday",
            "earningCash": fridayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": fridayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }, {
            "day": "saturday",
            "earningCash": saturdayCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "earningCard": saturdayCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        });

        let newData = {
            revenue: data,
            weekEarningCash: weekCash.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            weekEarningCard: weekCard.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }
        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(407).json({
            response: error
        })
    }
}

exports.threeMonthsRevenue = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var months = ['January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        var firstMonthName = months[new Date().getMonth()];
        var firstMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), 1)).toISOString().split('T')[0];
        var firstMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0];

        var secondMonthName = months[new Date().getMonth() - 1];
        var secondMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -1)).toISOString().split('T')[0];
        var secondMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0];

        var thirdMonthName = months[new Date().getMonth() - 2];
        var thirdMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -2)).toISOString().split('T')[0];
        var thirdMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 2, 2)).toISOString().split('T')[0];

        var firstMonthCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${firstMonthFirstDay}T00:00:00.000Z`,
                $lt: `${firstMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var firstMonthCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${firstMonthFirstDay}T00:00:00.000Z`,
                $lt: `${firstMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var firstMonthCashPay = 0;
        for (var i = 0; i < firstMonthCash.length; i++) {
            firstMonthCashPay += parseInt(firstMonthCash[i].price);
        }

        var firstMonthCardPay = 0;
        for (var i = 0; i < firstMonthCard.length; i++) {
            firstMonthCardPay += parseInt(firstMonthCard[i].price);
        }

        var secondMonthCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
                $lt: `${secondMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var secondMonthCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
                $lt: `${secondMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var secondMonthCashPay = 0;
        for (var i = 0; i < secondMonthCash.length; i++) {
            secondMonthCashPay += parseInt(secondMonthCash[i].price);
        }

        var secondMonthCardPay = 0;
        for (var i = 0; i < secondMonthCard.length; i++) {
            secondMonthCardPay += parseInt(secondMonthCard[i].price);
        }

        var thirdMonthCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
                $lt: `${thirdMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thirdMonthCard = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
                $lt: `${thirdMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var thirdMonthCashPay = 0;
        for (var i = 0; i < thirdMonthCash.length; i++) {
            thirdMonthCashPay += parseInt(thirdMonthCash[i].price);
        }

        var thirdMonthCardPay = 0;
        for (var i = 0; i < thirdMonthCard.length; i++) {
            thirdMonthCardPay += parseInt(thirdMonthCard[i].price);
        }

        var threeMonthCashPay = firstMonthCashPay + secondMonthCashPay + thirdMonthCashPay;
        var threeMonthCardPay = firstMonthCardPay + secondMonthCardPay + thirdMonthCardPay;
        var data = [{
                "month": firstMonthName,
                "earningCash": firstMonthCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                "earningCard": firstMonthCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            },
            {
                "month": secondMonthName,
                "earningCash": secondMonthCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                "earningCard": secondMonthCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            },
            {
                "month": thirdMonthName,
                "earningCash": thirdMonthCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                "earningCard": thirdMonthCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            }
        ]

        let newData = {
            revenue: data,
            earningCash: threeMonthCashPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            earningCard: threeMonthCardPay.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }

        res.status(201).json({
            data: newData
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.currentWeekBalance = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var curr = new Date();
        var sunday = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
        var saturday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var sundayCashPay = 0;

        for (var i = 0; i < sundayCash.length; i++) {
            sundayCashPay += parseInt(sundayCash[i].price);
        }

        var weekCash = parseFloat(sundayCashPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        var data = {
            "week": "Current Week",
            "startingBalance": weekCash
        };
        res.status(201).json({
            data: data
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.previousWeekBalance = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        var beforeOneWeek2 = new Date(beforeOneWeek);
        var sunday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay())).toISOString().split('T')[0];
        var saturday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var sundayCashPay = 0;

        for (var i = 0; i < sundayCash.length; i++) {
            sundayCashPay += parseInt(sundayCash[i].price);
        }

        var weekCash = parseFloat(sundayCashPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        var data = {
            "week": "Previous Week",
            "startingBalance": weekCash
        };
        res.status(201).json({
            data: data
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.threeMonthsBalance = async function (req, res) {
    var fleetId = req.params.fleetId
    try {
        var months = ['January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        var firstMonthName = months[new Date().getMonth()];
        var firstMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), 1)).toISOString().split('T')[0];
        var firstMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0];

        var secondMonthName = months[new Date().getMonth() - 1];
        var secondMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -1)).toISOString().split('T')[0];
        var secondMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0];

        var thirdMonthName = months[new Date().getMonth() - 2];
        var thirdMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -2)).toISOString().split('T')[0];
        var thirdMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 2, 2)).toISOString().split('T')[0];


        var fourthMonthName = months[new Date().getMonth() - 4];
        var fourthMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -4)).toISOString().split('T')[0];
        var fourthMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 4, 4)).toISOString().split('T')[0];

        var fifthMonthName = months[new Date().getMonth() - 5];
        var fifthMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -5)).toISOString().split('T')[0];
        var fifthMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 5, 5)).toISOString().split('T')[0];

        var sixthMonthName = months[new Date().getMonth() - 6];
        var sixthMonthFirstDay = new Date(new Date().setMonth(new Date().getMonth(), -5)).toISOString().split('T')[0];
        var sixthMonthLastDay = new Date(new Date().setMonth(new Date().getMonth() - 5, 5)).toISOString().split('T')[0];

        var firstMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${firstMonthFirstDay}T00:00:00.000Z`,
                $lt: `${firstMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var firstMonthPay = 0;
        for (var i = 0; i < firstMonth.length; i++) {
            firstMonthPay += parseInt(firstMonth[i].price);
        }

        var secondMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
                $lt: `${secondMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var secondMonthPay = 0;
        for (var i = 0; i < secondMonth.length; i++) {
            secondMonthPay += parseInt(secondMonth[i].price);
        }

        var thirdMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
                $lt: `${thirdMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thirdMonthPay = 0;
        for (var i = 0; i < thirdMonth.length; i++) {
            thirdMonthPay += parseInt(thirdMonth[i].price);
        }

        var fourthMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${fourthMonthFirstDay}T00:00:00.000Z`,
                $lt: `${fourthMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var fourthMonthPay = 0;
        for (var i = 0; i < fourthMonth.length; i++) {
            fourthMonthPay += parseInt(fourthMonth[i].price);
        }

        var fifthMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${fifthMonthFirstDay}T00:00:00.000Z`,
                $lt: `${fifthMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var fifthMonthPay = 0;
        for (var i = 0; i < fifthMonth.length; i++) {
            fifthMonthPay += parseInt(fifthMonth[i].price);
        }

        var sixthMonth = await Transaction.find({
            fleetOwnerId: fleetId,
            createdAt: {
                $gte: `${sixthMonthFirstDay}T00:00:00.000Z`,
                $lt: `${sixthMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')

        var sixthMonthPay = 0;
        for (var i = 0; i < sixthMonth.length; i++) {
            sixthMonthPay += parseInt(sixthMonth[i].price);
        }

        var firstThreeMonthPay = firstMonthPay + secondMonthPay + thirdMonthPay;
        var lastThreeMonthPay = fourthMonthPay + fifthMonthPay + sixthMonthPay;
        var data = {
            "firstThreeMonthPay": parseFloat(firstThreeMonthPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
            "lastThreeMonthPay": parseFloat(lastThreeMonthPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        }
        res.status(201).json({
            data: data
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.fetchOneRiderById = async function (req, res) {
    var riderId = req.params.id
    Rider.findOne({
            _id: riderId
        })
        .then(async result => {
            if (result != null) {

                var completedTripCount = await Transaction.countDocuments({
                    "userData.id": result._id,
                    status: "Completed",
                })

                var totalRatings = 0;
                var totalRatingQuery = await Transaction.find({
                    "userData.id": result._id,
                    status: "Completed",
                }).select('rate.digit -_id')
                for (var i = 0; i < totalRatingQuery.length; i++) {
                    if (totalRatingQuery[i].rate.digit) {
                        totalRatings += parseInt(totalRatingQuery[i].rate.digit);
                    }
                }

                var cancelledTripCount = await Trip.countDocuments({
                    userId: result._id,
                    status: "Cancelled",
                })


                var totalEarning = 0;
                var totalEarningQuery = await Transaction.find({
                    "userData.id": result._id,
                    status: "Completed",
                }).select('price -_id')
                for (var i = 0; i < totalEarningQuery.length; i++) {
                    totalEarning += parseInt(totalEarningQuery[i].price);
                }

                var totalCardEarning = 0;
                var totalCardEarningQuery = await Transaction.find({
                    "userData.id": result._id,
                    status: "Completed",
                    paymentType: "Card"
                }).select('price -_id')
                for (var i = 0; i < totalCardEarningQuery.length; i++) {
                    totalCardEarning += parseInt(totalCardEarningQuery[i].price);
                }


                var totalCashEarning = 0;
                var totalCashEarningQuery = await Transaction.find({
                    "userData.id": result._id,
                    status: "Completed",
                    paymentType: "Cash"
                }).select('price -_id')
                for (var i = 0; i < totalCashEarningQuery.length; i++) {
                    totalCashEarning += parseInt(totalCashEarningQuery[i].price);
                }
                let resData = {
                    stat: [{
                            name: 'completed trips',
                            value: completedTripCount,
                        },
                        {
                            name: 'rating',
                            value: totalRatings,
                        },
                        {
                            name: 'cancelled trip',
                            value: cancelledTripCount,
                        },
                    ],
                    earning: {
                        totalEarning: {
                            value: parseFloat(totalEarning).toFixed(2),
                        },
                        totalCardEarning: {
                            value: parseFloat(totalCardEarning).toFixed(2),
                        },
                        totalCashEarning: {
                            value: parseFloat(totalCashEarning).toFixed(2),
                        },
                    }
                }

                res.status(201).json({
                    result: resData
                })
            } else {
                res.status(422).json({
                    result: result,
                    error: "No Rider Found"
                })
            }
        })
        .catch(error => {
            console.log(error)
            res.status(422).json({
                error: error
            })
        })
}

//Delete One Rider By Id
exports.deleteOneRiderById = async function (req, res, next) {
    try {
        await Rider.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    "status.account": "Deleted"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/blocked.ejs", {
                    name: result.fullName
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "You account has been blocked",
                            html: data
                        };
                        transporter.sendMail(mainOptions, function (err, mes) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log('good')
                            }
                        });
                    }
                });
                res.status(201).json({
                    message: "Account Status Deleted successfully",
                    response: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

//Approve Rider By Id
exports.approveOneRiderById = async function (req, res, next) {
    try {
        await Rider.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    "status.account": "Approved"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/approved.ejs", {
                    name: result.fullName
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "Congratulations! You account has been Approved",
                            html: data
                        };
                        transporter.sendMail(mainOptions, function (err, mes) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log('good')
                            }
                        });
                    }
                });
                res.status(201).json({
                    message: "Account Status is Approved successfully",
                    response: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

//Block Rider By Id
exports.blockOneRiderById = async function (req, res, next) {
    try {
        await Rider.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    "status.account": "Blocked"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/blocked.ejs", {
                    name: result.fullName
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "You account has been blocked",
                            html: data
                        };
                        transporter.sendMail(mainOptions, function (err, mes) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log('good')
                            }
                        });
                    }
                });
                res.status(201).json({
                    message: "Account Status Blocked successfully",
                    response: result
                })
            })
            .catch(error => {
                res.status(404).json({
                    message: "record not found",
                    response: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}