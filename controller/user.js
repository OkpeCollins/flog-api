const {
    check,
    validationResult
} = require('express-validator');
const User = require('../models/user');
const Rider = require('../models/rider');
const Token = require('../models/token');
const Transaction = require('../models/transaction');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const Settings = require('../models/settings');
const Trip = require('../models/trip')
const PayStack = require('paystack-node')
const APIKEY = 'sk_live_2hWyQ6HW73jS8p1IkXmSWOlE4y9Inhgyd6g5f2R7'
const environment = process.env.NODE_ENV
const jwt_secret = process.env.SECRET
const paystack = new PayStack(APIKEY, environment)
const ejs = require('ejs');
const uuid = require('uuid');
const nodemailer = require("nodemailer");
const path = require('path');
const resetPassword = require("../utils/resetPassword");
const newAccount = require("../utils/newAccount");
const Coupon = require('../models/coupon');

exports.index = async function (req, res, next) {
    res.sendFile(path.join(__dirname, '../index.html'))
}

exports.coupon = async function (req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        }

        var code = req.body.code
        var userID = req.body.userId

        //Check if Coupon code exist
        var coupon = await Coupon.exists({
            code: code
        })
        if (!coupon) {
            console.log("Found")
            res.status(201).json({
                message: "Invalid Coupon Code",
                response: coupon
            })
        }

        //Check if the coupon code is still active
        var checkCouponIsValid = await Coupon.findOne({
            code: code
        })
        if (checkCouponIsValid.status == "Inactive") {
            res.status(201).json({
                message: "Coupon Code is Inactive",
                response: false
            })
        }

        //Check if the user has any active coupon code
        var userCheck = await User.findOne({
            _id: userID
        })
        if (userCheck.coupon.active) {
            res.status(403).json({
                message: "The user has an active coupon code",
                response: false
            })
        }

        //Update the user coupon code
        var save = await User.updateOne({
            _id: userID
        }, {
            $set: {
                "coupon.active": true,
                "coupon.code": checkCouponIsValid.code,
                "coupon.discount": checkCouponIsValid.percentage,
            }
        }, )
        if (!save) {
            res.status(403).json({
                message: "can not save, something went wrong",
                response: false
            })
        }
        res.status(201).json({
            message: "saved",
            response: true
        })
    } catch (error) {
        console.log(error)
        res.status(403).json({
            message: error
        })
    }
}

exports.checkActiveCoupon = async function (req, res) {
    var userID = req.params.userId
    //Check if the user has any active coupon code
    var userCheck = await User.findOne({
        _id: userID
    })
    if (!userCheck.coupon.active) {
        res.status(403).json({
            message: "The user has no active coupon code",
            response: false
        })
    }

    //Get coupon code data
    var checkCouponIsValid = await Coupon.findOne({
        code: userCheck.coupon.code
    })

    if (checkCouponIsValid.status == "Inactive") {
        res.status(201).json({
            message: "The Coupon Code is Inactive",
            response: false,
            data: checkCouponIsValid
        })
    }

    res.status(201).json({
        message: "Coupon Code detail",
        response: true,
        data: checkCouponIsValid
    })

}

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
                        user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: {
                                value: req.body.email
                            },
                            mobile: {
                                value: req.body.mobile
                            },
                            password: {
                                salt: salt,
                                hash: hash
                            }
                        })
                        User.exists({
                            "email.value": req.body.email
                        }, function (err, result) {
                            if (!result) {
                                User.exists({
                                    "mobile.value": req.body.mobile
                                }, function (err, result) {
                                    if (!result) {
                                        user.save()
                                            .then(result => {
                                                token = new Token({
                                                    _id: new mongoose.Types.ObjectId(),
                                                    userId: result.id,
                                                    cardId: "Cash",
                                                    default: true,
                                                    token: "Cash",
                                                    type: "Cash",
                                                    first_6digits: "Cash",
                                                    last_4digits: "Cash",
                                                    expiry: "Cash"
                                                });
                                                token.save()
                                                    .then(async savedToken => {
                                                            await newAccount(result.email.value, result.name, 1)
                                                            res.status(201).json({
                                                                message: "saved successfully ",
                                                                response: result
                                                            })
                                                        }

                                                    )
                                                    .catch(errror => {
                                                        console.log(errror)
                                                        res.status(422).json({
                                                            response: errror,
                                                            message: "Token not saved"
                                                        });
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
            User.exists({
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
            User.exists({
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
        await User.find({
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

exports.checkUser = async function (req, res, next) {
    try {
        await User.findOne({
                _id: req.params.id
            })
            .then(result => {
                if (result != null) {
                    if (result.status == "Blocked") {
                        res.status(403).json({
                            response: "User Account is Blocked",
                            message: result
                        })
                    } else {
                        res.status(201).json({
                            response: "User Account is Active",
                            message: result
                        })
                    }
                } else {
                    res.status(401).json({
                        response: "User Not Found",
                        message: result
                    })
                }
            })
            .catch(error => {
                res.status(401).json({
                    message: "User not found",
                    response: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.fetchOneByEmail = async function (req, res, next) {
    try {
        await User.find({
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
        await User.find({
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

exports.updateProfile = async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                message: "validation error",
                error: errors.mapped()
            })
        } else {
            await User.updateOne({
                    _id: req.body.userId
                }, {
                    $set: {
                        name: req.body.name,
                        "mobile.value": req.body.mobile,
                        "email.value": req.body.email,
                        "profilePicture.mimeType": req.body.profilePictureMimeType,
                        "profilePicture.value": req.body.profilePictureValue,
                    }
                }, )
                .then(result => {
                    User.findOne({
                            _id: req.body.userId
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
                                                        user: {
                                                            id: user.id,
                                                            name: user.name,
                                                            profilePicture: user.profilePicture,
                                                            profilePictureMimeType: user.profilePicture.mimeType,
                                                            email: user.email,
                                                            mobile: user.mobile,
                                                            notificationToken: user.notificationToken
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
                                        message: "User Account not Found"
                                    })
                                }
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
                            User.findOne({
                                    _id: req.body.id
                                })
                                .then(user => {
                                    if (user) {
                                        bcrypt.compare(req.body.currentPassword, user.password.hash, function (err, result) {
                                            if (result) {
                                                User.updateOne({
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
                                                res.status(400).json({
                                                    message: "Current Password is wrong",
                                                    response: err
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
                        console.log(result.status)
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
                var mobile = req.body.mobile;
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
                            res.status(200).json({
                                message: "Verification approved successfully",
                                response: verification_check.status
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

exports.isPasswordAndUserMatch = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            User.findOne({
                    "email.value": req.body.email
                })
                .then(user => {
                    if (user) {
                        var JWTUser = user.email.value;
                        bcrypt.compare(req.body.password, user.password.hash, function (err, result) {
                            if (result) {
                                if (user.status != "Blocked") {
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
                                                    statusCode: 201,
                                                    message: "Login Success",
                                                    data: {
                                                        user: {
                                                            id: user.id,
                                                            name: user.name,
                                                            profilePicture: user.profilePicture,
                                                            email: user.email,
                                                            mobile: user.mobile,
                                                            notificationToken: user.notificationToken
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
                                    res.status(401).json({
                                        message: "User Account has been Blocked"
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

exports.createTrip = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    }

    var settings = await Settings.findOne({
        id: 1
    })
    var userData = await User.findOne({
        _id: req.body.userId
    })
    var discount = 0
    // console.log(discount)
    var countTrip = await Trip.count({
        userId: req.body.userId,
        paymentStatus: {
            $ne: "Paid"
        },
        status: "Completed"
    })
    // console.log(countTrip)
    if (countTrip > 0) {
        res.status(201).json({
            message: "You have Unpaid trip",
            response: count
        })
    }
    if (settings == null) {
        res.status(404).json({
            error: "Settings details not found"
        })
    }
    var originLatitude = req.body.originLatitude;
    var originLongitude = req.body.originLongitude;
    var destinationLatitude = req.body.destinationLatitude;
    var destinationLongitude = req.body.destinationLongitude;
    var res2 = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + originLatitude + ',' + originLongitude + '&key=' + settings.googgleMap.API + '');
    var originData = res2.data;
    var res4 = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + destinationLatitude + ',' + destinationLongitude + '&key=' + settings.googgleMap.API + '');
    var destinationData = res4.data;
    var res3 = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + originLatitude + ',' + originLongitude + '&destinations=' + destinationLatitude + '%2C' + destinationLongitude + '&key=' + settings.googgleMap.API + '')
    var locationData = res3.data;
    var pricePerKilometer = settings.trip.pricePerKilometer;
    var distanceInKM = Math.round(locationData.rows[0].elements[0].distance.value / 1000, 2)
    var pricecalc = Math.round(pricePerKilometer * distanceInKM, 2)
    console.log(distanceInKM, pricePerKilometer, pricecalc)
    var fixedPrice = settings.trip.fixedPrice;

    if (distanceInKM <= 14) {
    // if (pricecalc <= settings.trip.fixedPrice) {
        var price = settings.trip.fixedPrice
        // console.log(fixedPrice + "1")
    } else {
        var price = pricecalc
        // console.log(Math.round(pricePerKilometer * locationData.rows[0].elements[0].distance.value / 1000, 0) + "2")
    }

    if (userData.coupon.active) {
        var coupon = await Coupon.findOne({
            code: userData.coupon.code
        })
        if (coupon.status == "Active") {
            discount = coupon.percentage / 100
            var discountPrice = price * discount
            price = price - discountPrice
        }

        await User.updateOne({
            _id: req.body.userId
        }, {
            $set: {
                "coupon.active": false,
                "coupon.code": null,
                "coupon.discount": null,
            }
        }, )
    }

    var ETAValue = Math.round(locationData.rows[0].elements[0].duration.value / 60, 0)
    var ETAText = locationData.rows[0].elements[0].duration.text
    var distanceText = locationData.rows[0].elements[0].distance.text
    var distanceValue = Math.round(locationData.rows[0].elements[0].distance.value / 1000, 2)

    var tripOriginText = originData.results[0].formatted_address
    var tripOriginLatitude = originData.results[0].geometry.location.lat
    var tripOriginLongitude = originData.results[0].geometry.location.lng

    var tripDestinationText = destinationData.results[0].formatted_address
    var tripDestinationLatitude = destinationData.results[0].geometry.location.lat
    var tripDestinationLongitude = destinationData.results[0].geometry.location.lng


    var createTrip = new Trip({
        _id: new mongoose.Types.ObjectId(),
        userId: req.body.userId,
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
        description: req.body.description,
        paymentType: userData.defaultPaymentType,
        price: price,
        ETA: {
            text: ETAText,
            value: ETAValue
        },
        distance: {
            text: distanceText,
            value: distanceValue
        },
        origin: {
            text: tripOriginText,
            latitude: tripOriginLatitude,
            longitude: tripOriginLongitude
        },
        destination: {
            text: tripDestinationText,
            latitude: tripDestinationLatitude,
            longitude: tripDestinationLongitude
        },
    });
    createTrip.save()
        .then(tripresponse => {
            res.status(201).json({
                status: 201,
                message: "Trip Booked",
                tripData: tripresponse
            })
        })
        .catch(tripError => {
            res.status(422).json({
                error: "Trip not Booked",
                message: tripError
            })
        })
};

exports.getCurrectLocation = async function (req, res, next) {
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
            var latitude = req.body.latitude;
            var longitude = req.body.longitude;
            axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + settings.googgleMap.API + '')
                .then(response => {
                    res.status(201).json({
                        message: response.data.results[0]
                    })
                })
                .catch(error => {
                    res.status(422).json({
                        message: error
                    })
                });
        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    }
};

exports.getLocationDetails = async function (req, res, next) {
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
            axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + originLatitude + ',' + originLongitude + '&destinations=' + destinationLatitude + '%2C' + destinationLongitude + '&key=' + settings.googgleMap.API + '')
                .then(response => {
                    res.status(201).json({
                        message: response.data
                    })
                })
                .catch(error => {
                    res.status(422).json({
                        message: error
                    })
                });
        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    }
};

exports.initiatePayment = async function (req, res, next) {
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
            const Flutterwave = require('flutterwave-node-v3');
            const flw = new Flutterwave(settings.payment.publicKey, settings.payment.secretKey);
            try {
                const payload = {
                    "card_number": req.body.card,
                    "cvv": req.body.cvv,
                    "expiry_month": req.body.expiry_month,
                    "expiry_year": req.body.expiry_year,
                    "currency": settings.payment.currency,
                    "amount": "50",
                    "redirect_url": "https://www.google.com",
                    "fullname": req.body.name,
                    "email": req.body.email,
                    "phone_number": req.body.mobile,
                    "enckey": settings.payment.encryptionKey,
                    "tx_ref": uuid.v4() // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
                }

                const chargeCard = async () => {
                    try {
                        const response = await flw.Charge.card(payload)
                        if (response.status == "success") {
                            if (response.meta.authorization.mode === 'pin') {
                                let payload2 = payload
                                payload2.authorization = {
                                    "mode": "pin",
                                    "fields": [
                                        "pin"
                                    ],
                                    "pin": req.body.pin
                                }
                                const reCallCharge = await flw.Charge.card(payload2)
                                res.status(201).json({
                                    message: reCallCharge
                                })
                            } else {
                                res.status(422).json({
                                    message: "something went wrong"
                                })
                            }
                        } else {
                            res.status(422).json({
                                error: response
                            })

                        }
                    } catch (error) {
                        console.log(error)
                        res.status(422).json({
                            message: "bad",
                            error: error
                        })
                    }
                }
                chargeCard();
            } catch (error) {
                console.log(error)
                res.status(422).json({
                    message: "bad",
                    error: error
                })
            }

        } else {
            res.status(422).json({
                message: "settings not found",
            })
        }
    }

};

exports.getAndConfirmPaymentOTP = async function (req, res, next) {
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
            const Flutterwave = require('flutterwave-node-v3');
            const flw = new Flutterwave(settings.payment.publicKey, settings.payment.secretKey);
            try {
                const chargeCard = async () => {
                    const callValidate = await flw.Charge.validate({
                        "otp": req.body.otp,
                        "flw_ref": req.body.flw_ref
                    })
                    if (callValidate.status == "success") {
                        const verify = async () => {
                            try {
                                const payload = {
                                    "id": callValidate.data.id
                                } //This is the transaction unique identifier. It is returned in the initiate transaction call as data.id}
                                const response = await flw.Transaction.verify(payload)
                                if (response.status == "success") {
                                    new Token({
                                        _id: new mongoose.Types.ObjectId(),
                                        userId: req.body.userId,
                                        cardId: response.data.id,
                                        token: response.data.card.token,
                                        type: response.data.card.type,
                                        first_6digits: response.data.card.first_6digits,
                                        last_4digits: response.data.card.last_4digits,
                                        expiry: response.data.card.expiry
                                    }).save();
                                    res.status(201).json({
                                        message: {
                                            responseFromOTP: callValidate,
                                            responseFromTransactionVerify: response
                                        }
                                    })
                                } else {
                                    res.status(422).json({
                                        message: {
                                            responseFromOTP: callValidate,
                                            responseFromTransactionVerify: response,
                                        }
                                    })
                                }
                            } catch (error) {
                                console.log(error)
                            }
                        }
                        verify();
                    } else {
                        res.status(422).json({
                            message: callValidate
                        })
                    }
                }
                chargeCard();
            } catch (error) {
                res.status(422).json({
                    message: "bad",
                    error: error
                })

            }

        } else {
            res.status(422).json({
                message: "settings not found",
            })
        }
    }

}

exports.refundTransaction = async function (req, res, next) {
    var id = req.params.id
    try {
        var settings = await Settings.findOne({
            id: 1
        })
        if (settings != null) {
            const Flutterwave = require('flutterwave-node-v3');
            const flw = new Flutterwave(settings.payment.publicKey, settings.payment.secretKey);
            try {
                const refund = async () => {
                    try {
                        const payload = {
                            "id": id, //This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
                            "amount": "50"
                        }
                        const response = await flw.Transaction.refund(payload)
                        if (response.status == "success") {
                            res.status(201).json({
                                message: response
                            })
                        } else {
                            res.status(422).json({
                                message: response
                            })
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
                refund();
            } catch (error) {
                res.status(422).json({
                    message: "bad",
                    error: error
                })
            }

        } else {
            res.status(422).json({
                message: "settings not found",
            })
        }
    } catch (error) {
        res.status(422).json({
            message: "bad",
            error: error
        })

    }

}

exports.setDefaultPaymentMethod = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            await Token.findOne({
                _id: req.body.paymentId,
                userId: req.body.userId
            }, function (err, data) {
                if (err || data == null) {
                    res.status(407).json({
                        message: "bad and not found",
                        error: err
                    })
                } else {
                    Token.updateMany({
                            userId: req.body.userId
                        }, {
                            $set: {
                                default: false
                            }
                        })
                        .then(data2 => {
                            if (data.type == "Cash") {
                                User.updateOne({
                                        _id: req.body.userId
                                    }, {
                                        $set: {
                                            defaultPaymentType: "Cash"
                                        }
                                    })
                                    .then(result => {
                                        Token.updateOne({
                                                _id: req.body.paymentId,
                                                userId: req.body.userId
                                            }, {
                                                $set: {
                                                    default: true
                                                }
                                            })
                                            .then(result3 => {
                                                res.status(201).json({
                                                    message: "Updated",
                                                    response: result3
                                                })
                                            })
                                            .catch(error => {
                                                res.status(407).json({
                                                    message: "bad update",
                                                    error: error
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        res.status(407).json({
                                            message: "bad",
                                            error: error
                                        })
                                    })
                            }
                            if (data.type != "Cash") {
                                User.updateOne({
                                        _id: req.body.userId
                                    }, {
                                        $set: {
                                            defaultPaymentType: "Card"
                                        }
                                    })
                                    .then(result => {
                                        Token.updateOne({
                                                _id: req.body.paymentId,
                                                userId: req.body.userId
                                            }, {
                                                $set: {
                                                    default: true
                                                }
                                            })
                                            .then(result3 => {
                                                res.status(201).json({
                                                    message: "Updated",
                                                    response: result3
                                                })
                                            })
                                            .catch(error => {
                                                res.status(407).json({
                                                    message: "bad update",
                                                    error: error
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        res.status(407).json({
                                            message: "bad",
                                            error: error
                                        })
                                    })
                            }
                        })
                        .catch(error => {
                            res.status(407).json({
                                message: "not change to false",
                                error: error
                            })
                        })
                }
            })
        } catch (error) {
            res.status(422).json({
                message: "bad",
                error: error
            })

        }
    }

}

exports.getAllUserCards = async function (req, res, next) {
    var id = req.params.userId
    try {
        Token.find({
            userId: id
        }, function (err, data) {
            if (err) {
                res.status(422).json({
                    message: "something not right!",
                    error: err
                })
            } else {
                res.status(201).json({
                    message: "All Cards Found",
                    data: data
                })
            }
        });
    } catch (error) {
        res.status(422).json({
            message: "bad",
            error: error
        })

    }

}

exports.chargePaymentWithToken = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            const charge_with_token = async () => {
                try {
                    const payload = {
                        "token": "flw-t1nf-403a5c98bf6a20f9fb2d2e738b351f2d-m03k", //This is the card token returned from the transaction verification endpoint as data.card.token
                        "currency": "NGN",
                        "country": "NG",
                        "amount": 20000,
                        "email": "amaofaith.o@gmail.com",
                        "first_name": "temi",
                        "last_name": "desola",
                        "narration": "Sample tokenized charge",
                        "tx_ref": "MCs" + Date.now(),
                        "redirect_url": "https://www.google.com"
                    }
                    const response = await flw.Tokenized.charge(payload)
                    //    console.log(response);
                    res.status(201).json({
                        message: response
                    })
                } catch (error) {
                    console.log(error)
                }

            }
            charge_with_token();
        } catch (error) {

        }
    }

}

exports.checkOnlineRider = async function (req, res, next) {
    try {
        await Rider.find({
                "status.trip": "Online"
            })
            .then(result => {
                if (result) {
                    res.status(201).json({
                        message: "List of Online Riders",
                        response: result
                    })
                } else {
                    res.status(403).json({
                        err: "No Online Rider Found"
                    })
                }
            })
            .catch(err => {
                res.status(404).json({
                    error: "No Online Rider Found"
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
};

exports.sendResetPasswordLink = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            await User.findOne({
                "email.value": req.body.email
            }, async function (err, result) {
                if (err) {
                    res.status(407).json({
                        message: "Something went wrong",
                        error: err
                    })
                } else {
                    if (result) {
                        await resetPassword(result.email.value, result._id, result.name, 1);
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
            console.log(error)
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
                        User.findOne({
                                _id: req.body.id
                            })
                            .then(user => {
                                if (user) {
                                    User.updateOne({
                                            _id: req.body.id
                                        }, {
                                            $set: {
                                                "password.salt": salt,
                                                "password.hash": hash
                                            }
                                        }, )
                                        .then(result => {
                                            ejs.renderFile("./emails/reset-password/confirm.ejs", {
                                                name: result.name
                                            }, function (err2, data) {
                                                if (err2) {
                                                    console.log(err2)
                                                } else {
                                                    var mainOptions = {
                                                        from: '"Flog Support" Support@flog.com',
                                                        to: result.email.value,
                                                        subject: "Congratulations! Your Password has been changed",
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
                                        message: "User not found"
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(404).json({
                                    message: "User not found",
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

exports.autoComplete = async function (req, res, next) {
    var address = req.params.address;
    try {
        var settings = await Settings.findOne({
            id: 1
        })
        if (settings != null) {
            axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + address + '&location=9.077751,8.6774567&radius=923768&strictbounds&key=' + settings.googgleMap.API + '')
                .then(response => {
                    res.status(201).json({
                        message: response.data
                    })
                })
                .catch(error => {
                    res.status(422).json({
                        error: error
                    })
                });

        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    } catch (error) {
        res.status(422).json({
            error: error
        })
    }
};

exports.getPlaceAddressByPlaceId = async function (req, res, next) {
    var place_id = req.params.place_id;
    try {
        var settings = await Settings.findOne({
            id: 1
        })
        if (settings != null) {
            axios.get('https://maps.googleapis.com/maps/api/geocode/json?place_id=' + place_id + '&key=' + settings.googgleMap.API + '')
                .then(response => {
                    res.status(201).json({
                        message: response.data
                    })
                })
                .catch(error => {
                    res.status(422).json({
                        error: error
                    })
                });

        } else {
            res.status(422).json({
                error: "API not found"
            })
        }
    } catch (error) {
        res.status(422).json({
            error: error
        })
    }
};

exports.cancelTrip = async function (req, res, next) {
    var trip_id = req.params.trip_id;
    try {
        Trip.updateOne({
                _id: trip_id
            }, {
                $set: {
                    status: "Cancelled"
                }
            })
            .then(result => {
                res.status(201).json({
                    message: result
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
};

exports.tripHistory = async function (req, res) {
    var userId = req.params.userId;
    try {
        Trip.find({
                userId: userId,
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
    var userId = req.params.userId;
    try {
        Trip.find({
                userId: userId,
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

exports.rate = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            const arr = [req.body.first, req.body.second, req.body.third, req.body.fourth, req.body.fifth];
            const good = "true";
            const occurrencesOf = (good, arr) => arr.reduce((counter, currentNumber) => (good === currentNumber ? counter + 1 : counter), 0);
            Trip.updateOne({
                    _id: req.body.tripId,
                    userId: req.body.userId
                }, {
                    $set: {
                        "rate.value": [req.body.first, req.body.second, req.body.third, req.body.fourth, req.body.fifth],
                        "rate.digit": occurrencesOf(good, arr),
                        "rate.text": req.body.text
                    }
                })
                .then(async result => {
                    await Transaction.updateOne({
                        tripId: req.body.tripId
                    }, {
                        $set: {
                            "rate.value": [req.body.first, req.body.second, req.body.third, req.body.fourth, req.body.fifth],
                            "rate.digit": occurrencesOf(good, arr),
                            "rate.text": req.body.text
                        }
                    })
                    res.status(201).json({
                        message: "Review updated successfully",
                        response: result
                    })
                })
                .catch(error => {
                    res.status(407).json({
                        message: "not updated",
                        response: error
                    })

                })
        } catch (error) {
            console.log(error)
        }
    }
}