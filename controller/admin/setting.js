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
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'clinton.haley@ethereal.email',
        pass: '3yfYXXw4fsX9r687D1'
    }
});
const moment = require("moment");


//Dashboard<% if (user.mobile){ %><%= user.mobile.value %><% } %>
exports.profile = async function (req, res) {
    try {
        res.render('admin/settings/profile', {
            user: req.user,
            title: "Admin Profile",
            moment: moment,
            error: {}
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

exports.updateProfile = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "All field are required")
        backURL = req.header('Referer')
        res.redirect(backURL)
    } else {
        try {
            await Admin.updateOne({
                    _id: req.body.id
                }, {
                    $set: {
                        "name": req.body.name,
                        "email": req.body.email,
                    }
                })
                .then(result => {
                    req.flash('success', "Updated Successfully! the update will effective when you logout")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                })
                .catch(error => {
                    req.flash('error', error.message)
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                })
        } catch (error) {
            console.log(error)
            req.flash('error', error)
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        }
    }
}

exports.changePassword = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "All field are required")
        res.render('admin/settings/profile', {
            user: req.user,
            title: "Admin Profile",
            moment: moment,
            error: errors.mapped()
        })
    } else {
        try {
            var admin = await Admin.find({
                _id: req.body.id
            })

            // console.log(admin[0].password)
            bcrypt.compare(req.body.currentPassword, admin[0].password.hash, function (err, result) {
                if (!result) {
                    req.flash('error', "The Current Password is Incorrect")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
            })
            
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(req.body.newPassword, salt, async function (err, hash) {
                    await Admin.updateOne({
                            _id: req.body.id
                        }, {
                            $set: {
                                "password.salt": salt,
                                "password.hash": hash,
                            }
                        })
                        .then(result => {
                            req.flash('success', "Password Updated Successfully")
                            backURL = req.header('Referer')
                            res.redirect(backURL)
                        })
                        .catch(error => {
                            req.flash('error', error.message)
                            backURL = req.header('Referer')
                            res.redirect(backURL)
                        })
                })
            })

        } catch (error) {
            console.log(error)
            req.flash('error', error)
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        }
    }
}

exports.appSettings = async function (req, res) {
    try {
        var settings = await Settings.find({
            id: 1
        })
        res.render('admin/settings/app-settings', {
            user: req.user,
            settings: settings,
            title: "App Settings",
        })
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

exports.saveAppSettings = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var settings = await Settings.find({
            id: 1
        })
        req.flash('error', "All field are required")
        res.render('admin/settings/app-settings', {
            user: req.user,
            settings: settings,
            title: "App Settings",
        })
    } else {
        try {
            // console.log(req.body)
            await Settings.updateOne({
                    id: 1
                }, {
                    $set: {
                        "twilio.ACCOUNTSID": req.body.ACCOUNTSID,
                        "twilio.SERVICE_SID": req.body.SERVICE_SID,
                        "twilio.AUTHTOKEN": req.body.AUTHTOKEN,
                        "googgleMap.API": req.body.googgleMap_api,
                        "trip.pricePerKilometer": req.body.pricePerKilometer,
                        "trip.fixedPrice": req.body.fixedPrice,
                        "payment.publicKey": req.body.publicKey,
                        "payment.secretKey": req.body.secretKey,
                        "payment.encryptionKey": req.body.encryptionKey,
                        "account.name": req.body.name,
                        "account.number": req.body.number,
                        "account.bank": req.body.bank,
                    }
                })
                .then(result => {
                    req.flash('success', "Updated Successfully")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                })
                .catch(error => {
                    req.flash('error', error.message)
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                })
        } catch (error) {
            console.log(error)
            req.flash('error', error)
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        }
    }
}