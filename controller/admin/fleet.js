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


//Approved Fleet Owner
exports.fleets = async function (req, res) {
    try {
        var pendingFleets = await Fleet.find({
            status: "Pending"
        }).sort({
            'createdAt': -1
        })
        var approvedFleets = await Fleet.find({
            status: "Approved"
        }).sort({
            'createdAt': -1
        })
        var blockedFleets = await Fleet.find({
            status: "Blocked"
        }).sort({
            'createdAt': -1
        })
        res.render('admin/fleets/index', {
            user: req.user,
            title: "Fleet Owners",
            moment: moment,
            pendingFleets: pendingFleets,
            approvedFleets: approvedFleets,
            blockedFleets: blockedFleets,
            sn: 1,
            sn1: 1,
            sn2: 1,
            sn3: 1
        })
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View Fleet by ID
exports.viewFleetByID = async function (req, res) {
    try {
        var getUser = await Fleet.findOne({
            _id: req.params.id
        })
        var getRiders = await Rider.find({
            "fleetOwnerData.fleetOwnerId": req.params.id
        }).sort({
            'createdAt': -1
        })
        var trips = await Trip.find({
            riderId: req.params.id
        }).sort({
            'createdAt': -1
        })

        res.render('admin/fleets/view-fleet', {
            user: req.user,
            title: "View Fleet",
            trips: trips,
            moment: moment,
            getUser: getUser,
            getRiders: getRiders,
            sn: 1,
            sn2: 2,
        })
    } catch (error) {
        req.flash('error', error.message)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View Fleet by ID
exports.viewEditFleetByID = async function (req, res) {
    try {
        var getUser = await Fleet.findOne({
            _id: req.params.id
        })
        res.render('admin/fleets/edit', {
            user: req.user,
            title: "Edit Fleet",
            moment: moment,
            getUser: getUser,
            error: {}
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//Admin Edit Fleet
exports.adminEditFleetByID = async function (req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', 'all fields are required')
            backURL = req.header('Referer')
            res.redirect(backURL)
        } else {
            console.log(req.body.accountNumber)
            await Fleet.updateOne({
                _id: req.body.id
            }, {
                $set: {
                    "city": req.body.city,
                    "RGNumber": req.body.RGNumber,
                    "accountDetails.bankName": req.body.bankName,
                    "accountDetails.accountName": req.body.accountName,
                    "accountDetails.accountNumber": req.body.accountNumber,
                }
            })
                .then(result => {
                    console.log(result)
                    req.flash('success', "Profile Updated Successfully")
                    backURL = 'view-fleet/' + req.body.id || req.header('Referer')
                    res.redirect(backURL)
                })
                .catch(error => {
                    req.flash('error', error.message)
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                })
        }
    } catch (error) {
        req.flash('error', error.message)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//Update Status by ID
exports.adminEditFleetStatusByID = async function (req, res) {
    async function update(status, id) {
        await Fleet.updateOne({
            _id: req.params.id
        }, {
            $set: {
                "status": status,
            }
        })
    }
    try {
        switch (req.params.status) {
            case "1":
                if (!update("Approved", req.params.id)) {
                    req.flash('error', "Unable to Approved, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                req.flash('success', "Approved Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
                break;
            case "0":
                if (!update("Blocked", req.params.id)) {
                    req.flash('error', "Unable to Block, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                req.flash('success', "Blocked Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
                break;
            case "2":
                await Fleet.deleteOne({
                    _id: req.params.id
                })
                    .then(result => {
                        req.flash('success', "Deleted Successfully")
                        backURL = req.header('Referer')
                        res.redirect(backURL)
                    })
                    .catch(error => {
                        req.flash('error', "Unable to Delete, try again!")
                        backURL = req.header('Referer')
                        res.redirect(backURL)
                    })
                break;
            default:
                break;
        }
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}