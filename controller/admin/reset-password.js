const {
    check,
    validationResult
} = require('express-validator');
const OnlineRider = require('../../models/onlineRider');
const Fleet = require('../../models/fleet');
const Rider = require('../../models/rider');
const Trip = require('../../models/trip')
const User = require('../../models/user');
const Admin = require('../../models/admin')
const Settings = require('../../models/settings');
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
const Transaction = require('../../models/transaction');
const resetPassword = require("../../utils/resetPassword");
const confirmPassword = require("../../utils/confirmPassword");
const moment = require("moment");


//Forget Password
exports.forgetPassword = async function (req, res, next) {
    res.render('auth/forget-password', {
        error: {},
        role: 3
    })
}


exports.adminForgetPasswordSend = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "Valid Email Address is required")
        res.redirect('/forget-password')
    } else {
        try {
            var checkId = await Admin.findOne({
                email: req.body.email
            }).limit(1)

            var checkIdUser = await User.findOne({
                "email.value": req.body.email
            }).limit(1)

            var checkIdRider = await Rider.findOne({
                "email.value": req.body.email
            }).limit(1)

            if (checkId) {
                await resetPassword(checkId.email, checkId._id, checkId.name, 3);
                req.flash('success', "Reset Password Link sent successfully")
                res.redirect('/forget-password')
            }
            if (checkIdUser) {
                await resetPassword(checkIdUser.email, checkIdUser._id, checkIdUser.name, 1);
                req.flash('success', "Reset Password Link sent successfully")
                res.redirect('/forget-password')
            }
            if (checkIdRider) {
                await resetPassword(checkIdRider.email, checkIdRider._id, checkIdRider.fullName, 2);
                req.flash('success', "Reset Password Link sent successfully")
                res.redirect('/forget-password')
            }

            req.flash('error', "No record found for this Email Address")
            res.redirect('/forget-password')

        } catch (error) {
            req.flash('error', error.message)
            backURL = req.header('Referer') || '/login';
            res.redirect(backURL);
        }
    }
}

exports.adminResetPassword = async function (req, res) {
    try {
        res.render('auth/admin-reset-password', {
            error: {},
            title: "Reset Password",
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

exports.resetPasswordLoad = async function (req, res) {
    try {
        var token = req.params.token
        jwt.verify(token, jwt_secret, async function (err, decode) {
            if (err) {
                req.flash('error', "Reset Password Link has expired, try again!")
                res.redirect('/forget-password')
            }
            switch (decode.role) {
                case 3:
                    var checkId = await Admin.findOne({
                        _id: decode.id
                    }).limit(1)
                    if (!checkId) {
                        req.flash('error', "Not account found, try again!")
                        res.redirect('/forget-password')
                    }
                    res.render('auth/reset-password', {
                        error: {},
                        user: checkId,
                        role: 3,
                        rider: {}
                    })
                    break;
                case 2:
                    var checkId = await Rider.findOne({
                        _id: decode.id
                    }).limit(1)
                    if (!checkId) {
                        req.flash('error', "Not account found, try again!")
                        res.redirect('/forget-password')
                    }
                    res.render('auth/reset-password', {
                        error: {},
                        rider: checkId,
                        role: 2,
                        user: {}
                    })

                    break;

                case 4:
                    var checkId = await Fleet.findOne({
                        _id: decode.id
                    }).limit(1)
                    if (!checkId) {
                        req.flash('error', "Not account found, try again!")
                        res.redirect('/forget-password')
                    }
                    res.render('auth/reset-password', {
                        error: {},
                        rider: checkId,
                        role: 4,
                        user: {}
                    })

                    break;

                case 1:
                    var checkId = await User.findOne({
                        _id: decode.id
                    }).limit(1)
                    if (!checkId) {
                        req.flash('error', "Not account found, try again!")
                        res.redirect('/forget-password')
                    }
                    res.render('auth/reset-password', {
                        error: {},
                        user: checkId,
                        role: 1,
                        rider: {}
                    })
                    break;
                default:
                    req.flash('error', "Reset Password Link has expired, try again!")
                    res.redirect('/forget-password')
                    break;
            }
        })

    } catch (error) {
        console.log("ll", error.message)
        req.flash('error', error.message)
        res.redirect('/forget-password')
    }
}

exports.resetPasswordSave = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', 'All fields are required, Password must contain one capital letter,one numerical and one special character')
        backURL = req.header('Referer') || '/forget-password';
        res.redirect(backURL);
    } else {
        try {

            bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(req.body.newPassword, salt, async function (err, hash) {
                    switch (req.body.role) {
                        case '3':
                            var admin = await Admin.findById(req.body.id)
                            await Admin.updateOne({
                                    _id: req.body.id
                                }, {
                                    $set: {
                                        "password.salt": salt,
                                        "password.hash": hash,
                                    }
                                })
                                .then(async result => {
                                    await confirmPassword(admin.email, admin.name);
                                    req.flash('success', "Password Updated Successfully")
                                    res.redirect('/forget-password')
                                })
                                .catch(error => {
                                    req.flash('error', "something went wrong, try again!")
                                    res.redirect('/forget-password')
                                })
                            break;
                        case '2':
                            var rider = await Rider.findById(req.body.id)
                            await Rider.updateOne({
                                    _id: req.body.id
                                }, {
                                    $set: {
                                        "password.salt": salt,
                                        "password.hash": hash,
                                    }
                                })
                                .then(async result => {
                                    await confirmPassword(rider.email, rider.fullName);
                                    req.flash('success', "Password Updated Successfully")
                                    res.redirect('/forget-password')
                                })
                                .catch(error => {
                                    req.flash('error', "something went wrong, try again!")
                                    res.redirect('/forget-password')
                                })

                            break;

                        case '4':
                            var fleet = await Fleet.findById(req.body.id)
                            await Fleet.updateOne({
                                    _id: req.body.id
                                }, {
                                    $set: {
                                        "password.salt": salt,
                                        "password.hash": hash,
                                    }
                                })
                                .then(async result => {
                                    await confirmPassword(fleet.email, fleet.fullName);
                                    req.flash('success', "Password Updated Successfully")
                                    res.redirect('/forget-password')
                                })
                                .catch(error => {
                                    req.flash('error', "something went wrong, try again!")
                                    res.redirect('/forget-password')
                                })

                            break;

                        case '1':
                            var user = await User.findById(req.body.id)
                            await User.updateOne({
                                    _id: req.body.id
                                }, {
                                    $set: {
                                        "password.salt": salt,
                                        "password.hash": hash,
                                    }
                                })
                                .then(async result => {
                                    await confirmPassword(user.email, user.name);
                                    req.flash('success', "Password Updated Successfully")
                                    res.redirect('/forget-password')
                                })
                                .catch(error => {
                                    req.flash('error', "something went wrong, try again!")
                                    res.redirect('/forget-password')
                                })
                            break;
                        default:
                            req.flash('error', "Token has expired, try again!")
                            res.redirect('/forget-password')
                            break;
                    }
                })
            })
        } catch (error) {
            req.flash('error', error.message)
            res.redirect('/forget-password')
        }
    }
}