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


//Verification
exports.verification = async function (req, res) {
    try {
        var fleets = await Fleet.find({"status":"Pending"}).sort({
            createdAt: 1
        })
        var riders = await Rider.find({"status.account":"Pending"}).sort({
            createdAt: 1
        })
        res.render('admin/verification/index', {
            user: req.user,
            title: "Verification",
            moment: moment,
            fleets: fleets,
            riders: riders,
            sn: 1,
            snn: 1
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}