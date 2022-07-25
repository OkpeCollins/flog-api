const {
    check,
    validationResult
} = require('express-validator');
const Rider = require('../models/rider');
const storeToken = require('../models/jwtToken');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const Chat = require('../models/message')
const Token = require('../models/token');
const Fleet = require('../models/fleet');
const Trip = require('../models/trip');
const OnlineRider = require('../models/onlineRider');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.SECRET
const crypto = require('crypto');
const ejs = require('ejs');
const nodemailer = require("nodemailer");
const axios = require('axios');
const Settings = require('../models/settings');
const resetPassword = require("../utils/resetPassword");
const newAccount = require("../utils/newAccount");
const moment = require("moment");
const {
    json
} = require('body-parser');


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
                            message: err
                        })
                    } else {
                        rider = new Rider({
                            _id: new mongoose.Types.ObjectId(),
                            fullName: req.body.fullName,
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
                                riderCard: {
                                    mimeType: req.body.ridersCardMimeType,
                                    value: req.body.ridersCardValue,
                                }
                            },
                            accountDetails: {
                                accountName: req.body.accountName,
                                accountNumber: req.body.accountNumber,
                                bankName: req.body.bankName
                            },
                            guarantor: {
                                name: req.body.guarantorName,
                                mobile: req.body.guarantorMobile,
                                occupation: req.body.guarantorOccupation,
                                relationship: req.body.guarantorRelationship,
                                address: req.body.guarantorAddress,
                                photo: {
                                    mimeType: req.body.guarantorPhotoMimeType,
                                    value: req.body.guarantorPhotoValue
                                }
                            }
                        })
                        Rider.exists({
                            "email.value": req.body.email
                        }, function (err, result) {
                            if (!result) {
                                Rider.exists({
                                    "mobile.value": req.body.mobile
                                }, function (err, result) {
                                    if (!result) {
                                        rider.save()
                                            .then(async result => {
                                                await newAccount(result.email.value, result.fullName, 2)
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
        // console.log(error)
        res.status(403).json({
            message: error.message
        })
    }
}

exports.logout = async function (req, res, next) {
    try {
        res.clearCookie('jwt')
        let token = req.decoded
        console.log(token)
        await storeToken.deleteOne({
            token: token
        })
        return res.status(200).json({
            "message": 'You have been Logged Out'
        });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            message: error.message
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
            Rider.exists({
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

exports.checkUniqueEmail = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            Rider.exists({
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

exports.fetchOneById = async function (req, res, next) {
    try {
        await Rider.find({
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

exports.checkRider = async function (req, res, next) {
    try {
        await Rider.findOne({
                _id: req.params.id
            })
            .then(result => {
                if (result != null) {
                    if (result.status.account == "Pending") {
                        res.status(407).json({
                            response: "Rider Account is Pending",
                            message: result
                        })
                    } else if (result.status.account == "Blocked") {
                        res.status(407).json({
                            response: "Rider Account is Blockd",
                            message: result
                        })
                    } else if (result.status.account == "Approved") {
                        res.status(201).json({
                            response: "Rider Account is Approved",
                            message: result
                        })
                    }
                } else {
                    res.status(404).json({
                        response: "Rider Not Found",
                        message: result
                    })
                }
            })
            .catch(error => {
                res.status(404).json({
                    message: "Rider not found",
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
        await Rider.find({
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
        await Rider.find({
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
        await Rider.deleteOne({
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
        await Rider.remove()
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
            try {
                await Rider.updateOne({
                        _id: req.body.riderId
                    }, {
                        $set: {
                            fullName: req.body.fullName,
                            "mobile.value": req.body.mobile,
                            "email.value": req.body.email,
                            "profilePicture.mimeType": req.body.profilePictureMimeType,
                            "profilePicture.value": req.body.profilePictureValue,
                        }
                    }, )
                    .then(result => {
                        Rider.findOne({
                                _id: req.body.riderId
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
                                                    riderData: {
                                                        message: "Status Updated Successfully",
                                                        updateMessage: result,
                                                        statusCode: 201,
                                                        data: {
                                                            rider: {
                                                                id: user.id,
                                                                fullName: user.fullName,
                                                                profilePicture: user.profilePicture,
                                                                profilePictureMimeType: user.profilePicture.mimeType,
                                                                email: user.email,
                                                                mobile: user.mobile,
                                                                notificationToken: user.notificationToken,
                                                                bikeManufacturer: user.bike.bikeManufacturer,
                                                                bikeType: user.bike.bikeType,
                                                                plateNumber: user.bike.licensePlate
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
                                            message: "Rider Account not Found"
                                        })
                                    }
                                } else {
                                    res.status(404).json({
                                        message: "Rider not found"
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
                            Rider.findOne({
                                    _id: req.body.id
                                })
                                .then(rider => {
                                    if (rider) {
                                        bcrypt.compare(req.body.currentPassword, rider.password.hash, function (err, result) {
                                            if (result) {
                                                Rider.updateOne({
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
                                            message: "Rider not found"
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
                            Rider.updateOne({
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

exports.isPasswordAndRiderMatch = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        }

        //Find Rider
        let rider = await Rider.findOne({
            "email.value": req.body.email
        })

        //Check if Rider exist
        if (!rider) {
            res.status(401).json({
                message: "No record found for the Rider"
            })
        }

        //check if it's Fleetowned and check it password
        if (rider.fleetOwnerData.fleetOwn) {
            let fleetowner = await Fleet.findOne({
                _id: rider.fleetOwnerData.fleetOwnerId
            })
            let checkFleetPassword = await bcrypt.compare(req.body.password, fleetowner.password.hash)
            if (!checkFleetPassword) {
                res.status(401).json({
                    message: "Incorrect password"
                })
            }
        }


        //check if rider password match
        if (!rider.fleetOwnerData.fleetOwn) {
            let checkRiderPassword = await bcrypt.compare(req.body.password, rider.password.hash)
            if (!checkRiderPassword) {
                res.status(401).json({
                    message: "Incorrect password"
                })
            }
        }

        switch (rider.status.account) {
            case "Pending":
                res.status(400).json({
                    message: "Rider account is not yet Approved"
                })
                break;
            case "Blocked":
                res.status(400).json({
                    message: "Rider account has been Blocked"
                })
                break
            case "Deleted":
                res.status(400).json({
                    message: "Rider account has been Deleted"
                })
                break
            case "Approved":
                let JWTToken = jwt.sign({
                    email: rider.email.value,
                    riderId: rider._id
                }, process.env.TOKEN_SECRETE, {
                    expiresIn: process.env.TOKEN_LIFE
                })
                let JWTRefreshToken = jwt.sign({
                    email: rider.email.value,
                    riderId: rider._id
                }, process.env.REFRESH_TOKEN_SECRETE, {
                    expiresIn: process.env.REFRESH_TOKEN_LIFE
                })

                new storeToken({
                    _id: new mongoose.Types.ObjectId(),
                    token: JWTToken
                }).save();
                res.status(201).json({
                    riderData: {
                        statusCode: 201,
                        message: "Login Success",
                        data: {
                            rider: {
                                id: rider.id,
                                email: rider.email,
                                mobile: rider.mobile,
                                notificationToken: rider.notificationToken,
                                fullName: rider.fullName,
                                profilePicture: rider.profilePicture,
                                bikeManufacturer: rider.bike.bikeManufacturer,
                                bikeType: rider.bike.bikeType,
                                plateNumber: rider.bike.licensePlate
                            },
                            tokens: {
                                accessToken: JWTToken,
                                refreshToken: JWTRefreshToken
                            }
                        }
                    }
                })
                break
        }

    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error.message
        })
    }

};

exports.goOnline = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            await Rider.findOne({
                    _id: req.body.userId
                })
                .then(result => {
                    if (result) {
                        if (result.status.trip != "Online") {
                            Rider.updateOne({
                                    _id: req.body.userId
                                }, {
                                    $set: {
                                        "status.trip": "Online"
                                    }
                                }, )
                                .then(result2 => {
                                    OnlineRider.count({
                                            riderId: result._id
                                        })
                                        .then(async result5 => {
                                            if (result5 == 0) {
                                                new OnlineRider({
                                                    _id: new mongoose.Types.ObjectId(),
                                                    riderId: result._id,
                                                    status: "Active",
                                                    timeOut: moment().add(process.env.TIME_OUT_HOUR, 'hours'),
                                                    destination: {
                                                        text: req.body.destinationText,
                                                        longitude: req.body.destinationLongitude,
                                                        latitude: req.body.destinationLatitude
                                                    }
                                                }).save();
                                            }
                                            await OnlineRider.updateOne({
                                                riderId: result._id
                                            }, {
                                                $set: {
                                                    "status": "Active",
                                                    "timeOut": moment().add(process.env.TIME_OUT_HOUR, 'hours'),
                                                }
                                            }, )
                                            res.status(201).json({
                                                message: "Status Changed to Online Successfully",
                                                riderDataId: result._id,
                                                data: result5
                                            })
                                        })
                                        .catch()
                                })
                                .catch(error => {
                                    res.status(404).json({
                                        message: "Status not changed",
                                        response: error
                                    })
                                })
                        } else {
                            res.status(201).json({
                                message: "Status is already Online",
                                riderDataId: result._id
                            })

                        }
                    } else {
                        res.status(403).json({
                            err: "No Record Found"
                        })
                    }
                })
                .catch(err => {
                    res.status(404).json({
                        error: "No Record Found"
                    })
                })
        } catch (error) {
            res.status(407).json({
                error: error
            })
        }
    }
}

exports.goOffline = async function (req, res, next) {
    if (req.params.id) {
        try {
            var countTrip = await OnlineRider.aggregate(
                [{
                        $match: {
                            "riderId": req.params.id
                        }
                    },
                    {
                        $unwind: "$trips"
                    },
                    {
                        $group: {
                            _id: null,
                            count: {
                                $sum: 1
                            }
                        }
                    }
                ]);
            await Rider.findOne({
                    _id: req.params.id
                })
                .then(result => {
                    console.log(countTrip[0])
                    if (result.status.trip != "Offline") {
                        if (countTrip[0]) {
                            if (countTrip[0].count > 0) {
                                res.status(422).json({
                                    message: "Can not go offline, because you have trip(s) that are yet to be delivered",
                                    tripOngoing: countTrip[0].count,
                                })
                            } else {
                                Rider.updateOne({
                                        _id: req.params.id
                                    }, {
                                        $set: {
                                            "status.trip": "Offline"
                                        }
                                    }, )
                                    .then(results => {
                                        OnlineRider.deleteOne({
                                                riderId: result._id
                                            })
                                            .then(riderDelete => {
                                                res.status(201).json({
                                                    message: "Status Changed to Offline Successfully",
                                                    delete: riderDelete
                                                })
                                            })
                                            .catch(deleteErr => {
                                                res.status(407).json({
                                                    message: "Status not changed",
                                                    deleteError: deleteErr
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        res.status(407).json({
                                            message: "Status not changed",
                                            response: error
                                        })
                                    })
                            }
                        } else {
                            Rider.updateOne({
                                    _id: req.params.id
                                }, {
                                    $set: {
                                        "status.trip": "Offline"
                                    }
                                }, )
                                .then(results => {
                                    OnlineRider.deleteOne({
                                            riderId: result._id
                                        })
                                        .then(riderDelete => {
                                            res.status(201).json({
                                                message: "Status Changed to Offline Successfully",
                                                delete: riderDelete
                                            })
                                        })
                                        .catch(deleteErr => {
                                            res.status(407).json({
                                                message: "Status not changed",
                                                deleteError: deleteErr
                                            })
                                        })
                                })
                                .catch(error => {
                                    res.status(407).json({
                                        message: "Status not changed",
                                        response: error
                                    })
                                })
                        }


                    } else {
                        res.status(201).json({
                            message: "Status is already Offline",
                            response: result.status.trip
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.status(404).json({
                        error: "No Record Found"
                    })
                })
        } catch (error) {
            console.log(error)
            res.status(422).json({
                error: error
            })
        }
    } else {
        res.status(407).json({
            error: "No ID is specified"
        })
    }
}

exports.acceptTrip = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        await Trip.findOne({
                _id: req.body.tripId
            })
            .then(tripData => {
                User.findOne({
                        _id: tripData.userId
                    })
                    .then(user => {
                        OnlineRider.findOne({
                                riderId: req.body.riderId
                            })
                            .then(riderData => {
                                Rider.findOne({
                                        _id: riderData.riderId
                                    })
                                    .then(rider => {
                                        OnlineRider.updateOne({
                                                riderId: req.body.riderId
                                            }, {
                                                $push: {
                                                    trips: {
                                                        id: req.body.tripId
                                                    }
                                                }
                                            })
                                            .then(result => {
                                                Trip.updateOne({
                                                        _id: req.body.tripId
                                                    }, {
                                                        $set: {
                                                            status: "Accepted",
                                                            riderId: riderData.riderId
                                                        }
                                                    })
                                                    .then(tripUpdate => {
                                                        Trip.count({
                                                                riderId: riderData.riderId,
                                                                status: "Completed"
                                                            })
                                                            .then(countTrip => {
                                                                res.status(201).json({
                                                                    message: "Rider Accept Trip Successfully",
                                                                    RiderId: riderData.riderId,
                                                                    RiderTrips: countTrip,
                                                                    UserData: user,
                                                                    RiderData: rider,
                                                                    TripData: tripData,
                                                                })
                                                            })
                                                            .catch(countTripError => {
                                                                console.log(countTripError)
                                                            })
                                                    })
                                                    .catch(tripUpdateError => {
                                                        console.log(tripUpdateError)
                                                    })
                                            })
                                            .catch(error => {
                                                res.status(407).json({
                                                    message: "Rider Not Found",
                                                    data: error,
                                                })
                                            })
                                    })
                                    .catch()
                            })
                            .catch(riderError => {
                                console.log(riderError)
                            })
                    })
                    .catch(userError => {
                        console.log(userError)
                    })
            })
            .catch(err => {
                res.status(407).json({
                    message: "Trip Not Found",
                    data: err,
                })
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
            await Rider.findOne({
                "email.value": req.body.email
            }, async function (err, result) {
                if (err) {
                    res.status(407).json({
                        message: "Something went wrong",
                        error: err
                    })
                } else {
                    if (result) {
                        await resetPassword(result.email.value, result._id, result.fullName, 2);
                        res.status(201).json({
                            message: "Reset Link Successfully",
                        })
                    } else {
                        res.status(403).json({
                            err: "No Record Found this Email"
                        })
                    }
                }
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
                        Rider.findOne({
                                _id: req.body.id
                            })
                            .then(rider => {
                                if (rider) {
                                    Rider.updateOne({
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
                                        message: "Rider not found"
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(404).json({
                                    message: "Rider not found",
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

exports.test = async function (req, res, next) {
    Settings.findOne({
            id: 1
        })
        .then(settings => {
            if (settings != null) {
                OnlineRider.find()
                    .then(driver => {
                        driver.forEach(function (item) {
                            axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + "7.392710" + ',' + "3.927680" + '&destinations=' + item.destination.latitude + '%2C' + item.destination.longitude + '&key=' + settings.googgleMap.API + '')
                                .then(locationDistance => {
                                    if (locationDistance.data.rows[0].elements[0].distance.value <= 2000) {
                                        res.status(201).json({
                                            message: item.riderId,
                                            data: locationDistance.data
                                        })
                                    } else {
                                        res.status(201).json({
                                            message: "no near rider found",
                                            data: locationDistance.data
                                        })
                                    }
                                })
                                .catch(locationDistanceError => {
                                    console.log(locationDistanceError)
                                })
                        })
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
        })
        .catch(err => {
            console.log(err)
        })
}

exports.startTrip = async function () {
    var trip_id = req.params.trip_id;
    try {
        Trip.updateOne({
                _id: trip_id
            }, {
                $set: {
                    status: "Ongoing"
                }
            })
            .then(result => {
                OnlineRider.updateOne({
                        riderId: result.riderId
                    }, {
                        $push: {
                            trips: {
                                id: trip_id
                            }
                        }
                    })
                    .then(start => {
                        res.status(201).json({
                            message: result,
                            response: start
                        })
                    })
                    .catch(error2 => {
                        res.status(422).json({
                            error: "error",
                            response: error2
                        })
                    })
                    .catch(error => {
                        res.status(422).json({
                            error: "error",
                            response: error
                        })
                    })
            })
            .catch(error => {
                res.status(422).json({
                    error: "error",
                    response: error
                })

            })
    } catch (error) {
        res.status(422).json({
            error: error
        })
    }
}

exports.cancelTrip = async function (req, res, next) {
    var trip_id = req.params.trip_id;
    try {
        Trip.findOne({
                _id: trip_id
            })
            .then(tripData => {
                if (tripData.status == "Pending") {
                    if (tripData.paymentType == "Card") {
                        User.findOne({
                                _id: tripData.userId
                            })
                            .then(userData => {
                                if (userData.defaultPaymentType == "Card") {
                                    // console.log(userData)
                                    Token.findOne({
                                            userId: tripData.userId,
                                            default: true
                                        })
                                        .then(token => {
                                            Settings.findOne({
                                                    id: 1
                                                })
                                                .then(settings => {
                                                    if (settings != null) {
                                                        const Flutterwave = require('flutterwave-node-v3');
                                                        const flw = new Flutterwave(settings.payment.publicKey, settings.payment.secretKey);
                                                        const charge_with_token = async () => {
                                                            try {
                                                                const payload = {
                                                                    "token": token.token, //This is the card token returned from the transaction verification endpoint as data.card.token
                                                                    "currency": "NGN",
                                                                    "country": "NG",
                                                                    "amount": tripData.price,
                                                                    "email": userData.email.value,
                                                                    "first_name": userData.name,
                                                                    "last_name": userData.name,
                                                                    "narration": tripData.destination.text,
                                                                    "tx_ref": "MCs" + Date.now(),
                                                                    "redirect_url": "https://www.google.com"
                                                                }
                                                                const response = await flw.Tokenized.charge(payload)
                                                                //    console.log(response);
                                                                if (response.status == "success") {
                                                                    Trip.updateOne({
                                                                            _id: trip_id
                                                                        }, {
                                                                            $set: {
                                                                                status: "Completed",
                                                                                paymentStatus: "Paid"
                                                                            }
                                                                        })
                                                                        .then(result => {
                                                                            res.status(201).json({
                                                                                message: result,
                                                                                response: response,
                                                                                riderId: tripData.riderId,
                                                                                tripId: tripData._id
                                                                            })
                                                                        })
                                                                        .catch(error => {
                                                                            res.status(422).json({
                                                                                error: "error",
                                                                                response: error
                                                                            })
                                                                        })
                                                                } else {
                                                                    Trip.updateOne({
                                                                            _id: trip_id
                                                                        }, {
                                                                            $set: {
                                                                                status: "Completed"
                                                                            }
                                                                        })
                                                                        .then(result => {
                                                                            res.status(201).json({
                                                                                message: result,
                                                                                response: response,
                                                                                riderId: tripData.riderId,
                                                                                tripId: tripData._id
                                                                            })
                                                                        })
                                                                        .catch(error => {
                                                                            res.status(422).json({
                                                                                error: "error",
                                                                                response: error
                                                                            })
                                                                        })
                                                                }
                                                            } catch (error) {
                                                                console.log(error)
                                                            }

                                                        }
                                                        charge_with_token();
                                                    }
                                                })
                                                .catch(settingsError => {
                                                    res.status(422).json({
                                                        message: settingsError
                                                    })
                                                })
                                        })
                                        .catch(tokenError => {
                                            res.status(422).json({
                                                error: "error",
                                                response: tokenError
                                            })
                                        })
                                } else {
                                    Trip.updateOne({
                                            _id: trip_id
                                        }, {
                                            $set: {
                                                status: "Completed"
                                            }
                                        })
                                        .then(result => {
                                            res.status(201).json({
                                                message: result,
                                                riderId: tripData.riderId,
                                                tripId: tripData._id
                                            })
                                        })
                                        .catch(error => {
                                            res.status(422).json({
                                                error: "trip update error",
                                                response: error
                                            })
                                        })
                                }
                            })
                            .catch(userError => {
                                res.status(422).json({
                                    error: "userdata error",
                                    response: userError
                                })
                            })
                    } else {
                        Trip.updateOne({
                                _id: trip_id
                            }, {
                                $set: {
                                    status: "Completed"
                                }
                            })
                            .then(result => {
                                res.status(201).json({
                                    message: result,
                                    riderId: tripData.riderId,
                                    tripId: tripData._id
                                })
                            })
                            .catch(error => {
                                res.status(422).json({
                                    error: "trip update error",
                                    response: error
                                })
                            })
                    }
                } else {
                    res.status(422).json({
                        error: "Trip is not Accepted"
                    })
                }
            })
            .catch(error => {
                res.status(422).json({
                    error: "error",
                    response: error
                })
            })
    } catch (error) {
        res.status(422).json({
            error: error
        })
    }
};

exports.findRiderAgain = async function (req, res, next) {
    var trip_id = req.params.trip_id;
    var data = ["60894621be2cee1e2c52d3e4", "60894621be2cee1e2c52d3e4", "60770e44600a432ec0214cfe", "607f71e81e47263d6c60c44e"];
    try {
        Trip.findOne({
                _id: trip_id
            })
            .then(trip => {
                if (trip.status == "Pending") {
                    Settings.findOne({
                            id: 1
                        })
                        .then(settings => {
                            if (settings != null) {
                                OnlineRider.find({})
                                    .then(driver => {
                                        driver.forEach(function (item) {
                                            console.log(data.includes(item.riderId))
                                            if (data.includes(item.riderId) == false) {
                                                axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + trip.destination.latitude + ',' + trip.destination.longitude + '&destinations=' + driver[0].destination.latitude + '%2C' + driver[0].destination.longitude + '&key=' + settings.googgleMap.API + '')
                                                    .then(locationDistance => {
                                                        if (locationDistance.data.rows[0].elements[0].distance.value <= 10000) {
                                                            res.status(201).json({
                                                                driver: item.riderId,
                                                                response: locationDistance.data
                                                            })
                                                            //Driver's ID
                                                            // io.to(item.riderId).emit("notifyDriver", trip);
                                                        } else {
                                                            res.status(201).json({
                                                                message: "rider not found within 10km ranmge",
                                                                driver: item.riderId,
                                                                response: locationDistance.data
                                                            })
                                                            console.log(locationDistance.data)
                                                        }
                                                    })
                                                    .catch(locationDistanceError => {
                                                        console.log(locationDistanceError, "error")
                                                    })
                                            } else {
                                                res.status(422).json({
                                                    message: "rider not found",
                                                    driver: item,
                                                })

                                            }
                                        })
                                    })
                                    .catch(error => {
                                        console.log(error)
                                    })
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                } else {
                    res.status(422).json({
                        error: "Trip is not Pending"
                    })
                }
            })
            .catch(error => {
                res.status(422).json({
                    error: "error",
                    response: error
                })
            })
    } catch (error) {
        res.status(422).json({
            error: error
        })
    }
};

exports.tripHistory = async function (req, res) {
    var riderId = req.params.riderId;
    try {
        Trip.find({
                riderId: riderId,
                status: {
                    $ne: "Completed"
                }
            }).sort({
                'createdAt': -1
            })
            .then(history => {
                res.status(201).json({
                    response: history
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {

    }
}

exports.completedTrips = async function (req, res) {
    var riderId = req.params.riderId;
    try {
        Trip.find({
                riderId: riderId,
                status: "Completed"
            }).sort({
                'createdAt': -1
            })
            .then(history => {
                res.status(201).json({
                    response: history
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {

    }
}
exports.todayEarningAndRating = async function (req, res) {
    var riderId = req.params.riderId
    try {
        var today = new Date().toISOString().split('T')[0];
        var todayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${today}T00:00:00.000Z`,
                $lt: `${today}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var todayRating = await Transaction.find({
            "riderData.id": riderId,
            status: "Completed",
            paymentStatus: "Paid"
        }).select('rate -_id')
        var todayRatingCount = await Transaction.countDocuments({
            "riderData.id": riderId,
            status: "Completed",
            paymentStatus: "Paid"
        })

        var todayPay = 0;
        var todayRating = 0;

        for (var i = 0; i < todayData.length; i++) {
            todayPay += parseInt(todayData[i].price);
        }

        for (var i = 0; i < todayRating.length; i++) {
            todayRating += parseInt(todayRating[i].rate.digit);
        }

        var totalRatingResult = Math.floor(todayRating / parseInt(todayRatingCount + 1))

        res.status(201).json({
            data: {
                "todayEarning": parseFloat(todayPay * 0.90).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                "todayRating": parseFloat(totalRatingResult).toFixed(2),
            }
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.currentWeekNet = async function (req, res) {
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var mondayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var tuesdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var wednesdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var thursdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var fridayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var saturdayData = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var mondayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var tuesdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var wednesdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var thursdayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var fridayData = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid"
        }).select('price -_id')
        var saturdayData = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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

        // var threeMonthPay = firstMonthPay + secondMonthPay + thirdMonthPay;
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
        console.log(months[new Date().getMonth() - 1], months[new Date().getMonth() - 3], months[new Date().getMonth() + 3])
        res.status(201).json({
            data: newData,
            secondMonthName: secondMonthName
        })
    } catch (error) {
        res.status(422).json({
            response: error
        })
    }
}

exports.currentWeekRevenue = async function (req, res) {
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var sundayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var mondayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var mondayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var tuesdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var tuesdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var wednesdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var wednesdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var thursdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thursdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var fridayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var fridayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var saturdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var saturdayCard = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var sundayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${sunday}T00:00:00.000Z`,
                $lt: `${sunday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var mondayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var mondayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${monday}T00:00:00.000Z`,
                $lt: `${monday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var tuesdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var tuesdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${tuesday}T00:00:00.000Z`,
                $lt: `${tuesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var wednesdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var wednesdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${wednesday}T00:00:00.000Z`,
                $lt: `${wednesday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var thursdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thursdayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thursday}T00:00:00.000Z`,
                $lt: `${thursday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var fridayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var fridayCard = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${friday}T00:00:00.000Z`,
                $lt: `${friday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Card"
        }).select('price -_id')

        var saturdayCash = await Transaction.find({
            "riderData.id": riderId,
            createdAt: {
                $gte: `${saturday}T00:00:00.000Z`,
                $lt: `${saturday}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var saturdayCard = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${firstMonthFirstDay}T00:00:00.000Z`,
                $lt: `${firstMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var firstMonthCard = await Transaction.find({
            "riderData.id": riderId,
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
                $lt: `${secondMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var secondMonthCard = await Transaction.find({
            "riderData.id": riderId,
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
            "riderData.id": riderId,
            createdAt: {
                $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
                $lt: `${thirdMonthLastDay}T23:59:59.999Z`
            },
            status: "Completed",
            paymentStatus: "Paid",
            paymentType: "Cash"
        }).select('price -_id')
        var thirdMonthCard = await Transaction.find({
            "riderData.id": riderId,
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
            // allthreeMonths: {
            //   earningCash: threeMonthCashPay,
            //   earningCard: threeMonthCardPay,
            // }
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
    var riderId = req.params.riderId
    try {
        var curr = new Date();
        var sunday = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
        // var monday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toISOString().split('T')[0];
        // var tuesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 2)).toISOString().split('T')[0];
        // var wednesday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 3)).toISOString().split('T')[0];
        // var thursday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 4)).toISOString().split('T')[0];
        // var friday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
    try {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        var beforeOneWeek2 = new Date(beforeOneWeek);
        var sunday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay())).toISOString().split('T')[0];
        // var monday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 1)).toISOString().split('T')[0];
        // var tuesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 2)).toISOString().split('T')[0];
        // var wednesday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 3)).toISOString().split('T')[0];
        // var thursday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 4)).toISOString().split('T')[0];
        // var friday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 5)).toISOString().split('T')[0];
        var saturday = new Date(beforeOneWeek2.setDate(beforeOneWeek2.getDate() - beforeOneWeek2.getDay() + 6)).toISOString().split('T')[0];

        var sundayCash = await Transaction.find({
            "riderData.id": riderId,
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
    var riderId = req.params.riderId
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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
            "riderData.id": riderId,
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

exports.saveChat = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            Chat.countDocuments({
                    tripId: req.body.tripId
                })
                .then(result => {
                    if (result == 0) {
                        chat = new Chat({
                            _id: new mongoose.Types.ObjectId(),
                            tripId: req.body.tripId,
                            messages: [{
                                _id: new mongoose.Types.ObjectId(),
                                text: req.body.text,
                                user: {
                                    _id: req.body.userId,
                                    name: req.body.userName
                                },
                            }]
                        });
                        chat.save();
                        res.status(201).json({
                            message: "Chat Saved"
                        })
                    } else {
                        Chat.updateOne({
                                tripId: req.body.tripId
                            }, {
                                $push: {
                                    "messages": [{
                                        _id: new mongoose.Types.ObjectId(),
                                        text: req.body.text,
                                        user: {
                                            _id: req.body.userId,
                                            name: req.body.userName
                                        }
                                    }],
                                }
                            })
                            .then(result2 => {
                                // console.log(result2)
                                res.status(201).json({
                                    message: "chat pushed",
                                    response: result2
                                })
                            })
                            .catch(error => {
                                console.log(error)
                                res.status(422).json({
                                    error: error
                                })
                            })
                    }
                })
                .catch(error => {
                    res.status(422).json({
                        error: error
                    })
                })

        } catch (error) {
            res.status(422).json({
                error: error
            })
        }
    }
}

exports.fetchChat = async function (req, res, next) {
    tripId = req.params.tripId
    try {
        await Chat.find({
                tripId: tripId
            }).select('messages -_id').sort({
                'createdAt': -1
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
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.findUser = async function (req, res, next) {
    id = req.params.id
    try {
        var rider = await Rider.findOne({
            _id: id
        });
        var user = await User.findOne({
            _id: id
        });
        if (user == null) {
            res.status(201).json({
                notificationToken: rider.notificationToken
            })
        }
        if (rider == null) {
            res.status(200).json({
                notificationToken: user.notificationToken
            })
        }
        if (user == null && rider == null) {
            res.status(404).json({
                notificationTokenMessage: "Token not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.flogAccount = async function (req, res) {
    try {
        await Settings.findOne({
                id: 1
            })
            .then(settings => {
                if (settings != null) {
                    res.status(201).json({
                        data: {
                            accountNumber: settings.account.number,
                            accountName: settings.account.name,
                            bankName: settings.account.bank,
                            reference: crypto.randomBytes(10).toString('hex')
                        }
                    })
                } else {
                    res.status(201).json({
                        response: "Account Details is Null"
                    })
                }
            })
            .catch(error => {
                res.status(422).json({
                    error: error
                })
            })
    } catch (error) {
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

exports.polyline = async function (req, res, next) {
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
            var originLatitude = req.body.originLatitude;
            var originLongitude = req.body.originLongitude;
            var destinationLatitude = req.body.destinationLatitude;
            var destinationLongitude = req.body.destinationLongitude;
            axios.get('https://maps.googleapis.com/maps/api/directions/json?origin=' + originLatitude + ',' + originLongitude + '&destination=' + destinationLatitude + ',' + destinationLongitude + '&key=' + settings.googgleMap.API + '')
                .then(response => {
                    res.status(201).json({
                        message: response.data.routes[0].overview_polyline.points
                    })
                })
                .catch(error => {
                    res.status(422).json({
                        message: error
                    })
                });
        } else {
            res.status(422).json({
                error: "API Key Settings not found"
            })
        }
    }
};