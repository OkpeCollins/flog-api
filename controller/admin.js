const {
    check,
    validationResult
} = require('express-validator');
const OnlineRider = require('../models/onlineRider');
const Fleet = require('../models/fleet');
const Rider = require('../models/rider');
const Trip = require('../models/trip')
const User = require('../models/user');
const Admin = require('../models/admin')
const Settings = require('../models/settings');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const LocalStrategy = require("passport-local").Strategy
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.SECRET
const crypto = require('crypto');
const ejs = require('ejs');
const nodemailer = require("nodemailer");
const passport = require('passport');
const Transaction = require('../models/transaction');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'clinton.haley@ethereal.email',
        pass: '3yfYXXw4fsX9r687D1'
    }
});
const moment = require("moment");

//Login
exports.login = async function (req, res, next) {
    res.render('auth/login', {
        error: {}
    })
}


//Admin Login
exports.adminLogin = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', 'All fields are required')
        res.render('auth/login', {
            messages: {},
            data: req.body,
            error: errors.mapped()
        })
    } else {
        next();
    }
}

exports.isPasswordAndFleetMatch = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('auth/login', {
            messages: {},
            data: req.body,
            error: errors.mapped()
        })
    } else {
        try {
            Admin.findOne({
                    email: req.body.email
                })
                .then(admin => {
                    if (admin) {
                        bcrypt.compare(req.body.password, admin.password.hash, function (err, result) {
                            if (result) {
                                jwt.sign({
                                    admin
                                }, process.env.SECRET, (err, token) => {
                                    if (err) {
                                        res.status(407).json({
                                            message: "JWT Error",
                                            error: err
                                        })
                                    } else {
                                        let salt = crypto.randomBytes(16).toString('base64');
                                        let hash = crypto.createHmac('sha512', salt).update(admin.id).digest("base64");
                                        let b = Buffer.from(hash);
                                        let refresh_token = b.toString('base64');
                                        res.status(201).json({
                                            adminData: {
                                                statusCode: 201,
                                                message: "Login Success",
                                                data: {
                                                    admin: {
                                                        id: admin.id,
                                                        email: admin.email,
                                                        mobile: admin.mobile,
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
                                    message: "Incorrect password"
                                })
                            }
                        });
                    } else {
                        res.status(404).json({
                            message: "Admin not found"
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

exports.log = passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
    function (req, email, password, done) {
        Admin.findOne({
                email: email
            })
            .then(async admin => {
                if (await bcrypt.compare(password, admin.password.hash)) {
                    console.log('correct password')
                    return done(null, admin);
                } else {
                    return done(null, false, req.flash('error', 'Incorrect Password'));
                }
            })
            .catch(err => {
                req.flash('error', err.message)
                return done(null, false);
            })
        passport.serializeUser(function (admin, done) {
            done(null, admin);
        });

        passport.deserializeUser(function (admin, done) {
            done(null, admin);
        });

    }));

    
//Dashboard
exports.dashboard = async function (req, res) {
    try {
        var fleets = await Fleet.find().limit(5).sort({
            createdAt: -1
        })
        var users = await User.find().limit(5).sort({
            createdAt: -1
        })
        var riders = await Rider.find().limit(5).sort({
            createdAt: -1
        })
        var tripCount = await Trip.countDocuments()
        var userCount = await User.countDocuments()
        var riderCount = await Rider.countDocuments()
        var fleetCount = await Fleet.countDocuments()
        var transactionsCount = await Transaction.countDocuments()
        res.render('admin/dashboard', {
            user: req.user,
            title: "Admin Dashboard",
            moment: moment,
            fleets: fleets,
            users: users,
            riders: riders,
            userCount:userCount,
            riderCount:riderCount,
            fleetCount:fleetCount,
            sn: 1,
            snn: 1,
            snnn: 1,
            tripCount: tripCount,
            transactionsCount:transactionsCount
        })
    } catch (error) {
        console.log(error)
        req.flash('error', error.message)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//Get Riders By Status
exports.getAllRiderByStatus = async function (req, res) {
    try {
        var status = req.body.status
        var riders = await Rider.find({
            "status.account": status
        })
        // return status
        switch (status) {
            case "Pending":
                // console.log(riders)
                res.status(200).send({
                    riders: riders
                });
                break;

            default:
                res.status(400).send({
                    error: "error"
                })
                break;
        }
    } catch (error) {
        res.status(400).send({
            error: error
        })
    }
}


exports.logout = function (req, res, next) {
    try {
        req.logout();
        res.redirect('login');
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);

    }
}

//Users
//Fetch All Users
exports.fetchAllUsers = async function (req, res, next) {
    try {
        await User.find()
            .then(result => {
                res.status(201).json({
                    AllUsers: result
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

//Fetch One User By Id
exports.fetchOneUserById = async function (req, res, next) {
    try {
        await User.findOne({
                _id: req.params.id
            })
            .then(result => {
                if (result != null) {
                    res.status(201).json({
                        message: result
                    })
                } else {
                    res.status(404).json({
                        response: "record Not found"
                    })
                }
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

//Fetch One User By Email
exports.fetchOneUserByEmail = async function (req, res, next) {
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

//Fetch One User By Mobile
exports.fetchOneUserByMobile = async function (req, res, next) {
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

//Delete One User By Id
exports.deleteOneUserById = async function (req, res, next) {
    try {
        await User.deleteOne({
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
        console.log(error)
        res.status(407).json({
            error: error
        })
    }
}

//delete All Users
exports.deleteAllUsers = async function (req, res, next) {
    try {
        await User.remove()
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

//Approve User By Id
exports.activateOneUserById = async function (req, res, next) {
    try {
        await User.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: "Active"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/active.ejs", {
                    name: result.name
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "Congratulations! You account is now Active",
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
                    message: "Account Status is Active successfully",
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

//Block User By Id
exports.blockOneUserById = async function (req, res, next) {
    try {
        await User.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: "Blocked"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/blocked.ejs", {
                    name: result.name
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "You account has been Blocked",
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
                    message: "Account Status is Blocked successfully",
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

//Riders
//Fetch All Riders
exports.fetchAllRiders = async function (req, res, next) {
    try {
        await Rider.find()
            .then(result => {
                res.status(201).json({
                    allRiders: result
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

//Fetch One Rider By ID
exports.fetchOneRiderById = async function (req, res, next) {
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

//Fetch One Rider By Email
exports.fetchOneRiderByEmail = async function (req, res, next) {
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

//Fetch One Rider By Mobile
exports.fetchOneRiderByMobile = async function (req, res, next) {
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
                    message: "Account Deleted successfully",
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

//Delete All Riders
exports.deleteAllRiders = async function (req, res, next) {
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
                    message: "Account Blocked successfully",
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

//Pending Rider By Id
exports.pendingOneRiderById = async function (req, res, next) {
    try {
        await Rider.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    "status.account": "Pending"
                }
            }, )
            .then(result => {
                res.status(201).json({
                    message: "Account Status has changed to Pending successfully",
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

//Fleet
//Fetch All Fleets Owners
exports.fetchAllFleetOwners = async function (req, res, next) {
    try {
        await Fleet.find()
            .then(result => {
                res.status(201).json({
                    allFleetOwners: result
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

//Fetch One Fleet Owner By Id
exports.fetchOneFleetOwnerById = async function (req, res, next) {
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

//Fetch One Fleet Owner By Email
exports.fetchOneFleetOwnerByEmail = async function (req, res, next) {
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

//Fetch One Fleet Onwer By Mobile
exports.fetchOneFleetOwnerByMobile = async function (req, res, next) {
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

//Delete Fleet Owner By Id
exports.deleteOneFleetOwnerById = async function (req, res, next) {
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
        res.status(407).json({
            error: error
        })
    }
}

//Delete All Fleet Owners
exports.deleteAllFleetOwners = async function (req, res, next) {
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

//Approve Fleet Owner By Id
exports.approveOneFleetOwnerById = async function (req, res, next) {
    try {
        await Fleet.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: "Approved"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/approved.ejs", {
                    name: result.companyName
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
exports.blockOneFleetOwnerById = async function (req, res, next) {
    try {
        await Fleet.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: "Blocked"
                }
            }, )
            .then(result => {
                ejs.renderFile("./emails/account/blocked.ejs", {
                    name: result.companyName
                }, function (err2, data) {
                    if (err2) {
                        console.log(err2)
                    } else {
                        var mainOptions = {
                            from: '"Flog Support" Support@flog.com',
                            to: result.email.value,
                            subject: "Your account has been Blocked",
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
                    message: "Account Status is Blocked successfully",
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

//Pending Rider By Id
exports.pendingOneFleetOwnerById = async function (req, res, next) {
    try {
        await Fleet.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    status: "Pending"
                }
            }, )
            .then(result => {
                res.status(201).json({
                    message: "Account Status is Pending successfully",
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

//Admin
//Admin Create
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
                        admin = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            mobile: req.body.mobile,
                            email: req.body.email,
                            password: {
                                salt: salt,
                                hash: hash
                            },
                        })
                        Admin.exists({
                            email: req.body.email
                        }, function (err, result) {
                            if (!result) {
                                Admin.exists({
                                    mobile: req.body.mobile
                                }, function (err, result) {
                                    if (!result) {
                                        admin.save()
                                            .then(result => {
                                                ejs.renderFile("./emails/welcome/admin.ejs", {
                                                    name: result.name
                                                }, function (err2, data) {
                                                    if (err2) {
                                                        console.log(err2)
                                                    } else {
                                                        var mainOptions = {
                                                            from: '"Flog Support" Support@flog.com',
                                                            to: result.email,
                                                            subject: "Congratulations! Thanks for signing up",
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

//Admin Update Password
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
                            Admin.findOne({
                                    _id: req.body.id
                                })
                                .then(admin => {
                                    if (admin) {
                                        bcrypt.compare(req.body.currentPassword, admin.password.hash, function (err, result) {
                                            if (result) {
                                                Admin.updateOne({
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
                                            message: "Admin not found"
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

//Settings
exports.settings = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "validation error",
            error: errors.mapped()
        })
    } else {
        try {
            Settings.updateOne({
                    id: 1
                }, {
                    $set: {
                        "twilio.ACCOUNTSID": req.body.TWILIOACCOUNTSID,
                        "twilio.SERVICE_SID": req.body.TWILIOSERVICE_SID,
                        "twilio.AUTHTOKEN": req.body.TWILIOAUTHTOKEN,
                        "twilio.CHANNEL": req.body.TWILIOCHANNEL,
                        "googgleMap.API": req.body.googgleMapAPI,
                        "trip.pricePerKilometer": req.body.tripPricePerKilometer,
                        "trip.fixedPrice": req.body.tripFixedPrice
                    }
                }, ).then(result => {
                    res.status(200).json({
                        message: "Settings Updated Successfully",
                        response: result
                    })
                })
                .catch(error => {
                    res.status(404).json({
                        message: "Error Occur",
                        response: error
                    })
                })
        } catch (error) {
            res.status(400).json({
                message: "Error Occur",
                error: error
            })
        }
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
            await Admin.findOne({
                    email: req.body.email
                })
                .then(result => {
                    if (result) {
                        var host = req.get('host');
                        var token = jwt.sign({
                            id: result._id
                        }, jwt_secret, {
                            expiresIn: 3600 // 1 hour
                        });
                        var link = host + "/user-reset-password/" + token
                        ejs.renderFile("./emails/reset-password/html.ejs", {
                            name: result.name,
                            link: link
                        }, function (err2, data) {
                            if (err2) {
                                console.log(err2)
                            } else {
                                var mainOptions = {
                                    from: '"Flog Support" Support@flog.com',
                                    to: result.email,
                                    subject: "Reset Your Password",
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
                            message: "Admin Found",
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
                        Admin.findOne({
                                _id: req.body.id
                            })
                            .then(fleet => {
                                if (fleet) {
                                    Admin.updateOne({
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
                                                        to: result.email,
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
                                        message: "Admin not found"
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(404).json({
                                    message: "Admin not found",
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

//Trips
exports.tripHistory = async function (req, res) {
    try {
        Trip.find({
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
    try {
        Trip.find({
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

exports.getTripById = async function (req, res) {
    var id = req.params.tripId
    try {
        Trip.findOne({
                _id: id
            })
            .then(data => {
                if (data != null) {
                    res.status(201).json({
                        response: data
                    })
                } else {
                    res.status(404).json({
                        response: "Trip Not found"
                    })
                }
            })
            .catch(error => {
                res.status(407).json({
                    message: "Trip not found",
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.deleteOneTrips = async function (req, res) {
    var id = req.params.tripId
    try {
        Trip.remove({
                _id: id
            })
            .then(data => {
                res.status(201).json({
                    response: data
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.deleteAllTrips = async function (req, res) {
    try {
        Trip.remove()
            .then(data => {
                res.status(201).json({
                    response: data
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

//Online Riders
exports.onlineRiders = async function (req, res) {
    try {
        OnlineRider.find().sort({
                'createdAt': -1
            })
            .then(data => {
                res.status(201).json({
                    response: data
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.findOnlineRiderById = async function (req, res) {
    var id = req.params.id;
    try {
        OnlineRider.find({
                riderId: id
            }).sort({
                'createdAt': -1
            })
            .then(data => {
                res.status(201).json({
                    response: data
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}

exports.deleteAllOnlineRider = async function (req, res) {
    try {
        OnlineRider.remove()
            .then(data => {
                res.status(201).json({
                    response: data
                })
            })
            .catch(error => {
                res.status(407).json({
                    error: error
                })
            })
    } catch (error) {
        res.status(407).json({
            error: error
        })
    }
}