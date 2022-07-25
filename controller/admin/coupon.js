const {
    check,
    validationResult
} = require('express-validator');
const Coupon = require('../../models/coupon');
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
const crypto = require('crypto');
const ejs = require('ejs');
const Transaction = require('../../models/transaction');
const moment = require("moment");

exports.index = async function (req, res) {
    try {
        var coupons = await Coupon.find({})
        res.render('admin/coupon/index', {
            sn: 1,
            coupons: coupons,
            title: "Coupon Codes",
            error: {},
            moment: moment
        })
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}
exports.create = async function (req, res) {
    try {
        res.render('admin/coupon/create', {
            title: "Create Coupon",
            error: {}
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}
exports.edit = async function (req, res) {
    try {
        var coupon = await Coupon.find({
            _id: req.params.id
        })
        if (!coupon) {
            req.flash('warning', "Coupon Code not found")
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        }

        res.render('admin/coupon/edit', {
            coupon: coupon,
            title: "Edit Coupon",
            error: {}
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

exports.updateStatus = async function (req, res) {
    console.log(req.body)
    await Coupon.updateOne({
            _id: req.body.id
        }, {
            $set: {
                status: req.body.status
            }
        }, )
        .then(result => {
            return result
        })
        .catch(error => {
            return error
        })
}

exports.update = async function (req, res) {
    console.log(req.body)
    await Coupon.updateOne({
            _id: req.body.id
        }, {
            $set: {
                code: req.body.code,
                percentage: req.body.percentage
            }
        }, )
        .then(result => {
            req.flash('success', "Updated successfully")
            res.redirect('coupon-codes');
        })
        .catch(error => {
            req.flash('error', error)
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        })
}

exports.createNew = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "All field are required")
        res.render('admin/coupon/create', {
            user: req.user,
            title: "Create Coupon",
            error: errors.mapped()
        })
    } else {
        try {
            var code = req.body.code;
            var percentage = req.body.percentage;

            var coupon = new Coupon({
                _id: new mongoose.Types.ObjectId(),
                code: code,
                percentage: percentage
            })
            var check = Coupon.exists({
                code: code
            })
            coupon.save()
            req.flash('success', "Coupon Code created successfully")
            res.redirect('coupon-codes');


        } catch (error) {
            console.log(error)
            req.flash('error', error)
            backURL = req.header('Referer') || '/dashboard';
            res.redirect(backURL);
        }
    }
}