const {
    check,
    validationResult
} = require('express-validator');
const Trip = require('../../models/trip')
const User = require('../../models/user');
const Transaction = require('../../models/transaction');
const moment = require("moment");
const accountStatus = require("../../utils/accountStatus");


//Users
exports.allUsers = async function (req, res) {
    try {
        var activeUsers = await User.find({
            "status": "Active"
        }).sort({
            'createdAt': -1
        })

        var blockUsers = await User.find({
            "status": "Blocked"
        }).sort({
            'createdAt': -1
        })
        res.render('admin/users/index', {
            user: req.user,
            title: "Users",
            moment: moment,
            activeUsers: activeUsers,
            blockUsers: blockUsers,
            sn2: 1,
            sn: 1
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View User by ID
exports.viewUserByID = async function (req, res) {
    try {
        var getUser = await User.find({
            _id: req.params.id
        })
        var userTransactions = await Transaction.find({
            "userData.id": req.params.id
        }).sort({
            'createdAt': -1
        })
        var trips = await Trip.find({
            userId: req.params.id
        }).sort({
            'createdAt': -1
        })
        // console.log(getUser)
        res.render('admin/users/view-user', {
            user: req.user,
            title: "View User",
            trips: trips,
            moment: moment,
            getUser: getUser,
            sn: 1,
            sn2: 2,
            userTransactions: userTransactions
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View User by ID
exports.viewEditUserByID = async function (req, res) {
    try {
        var getUser = await User.find({
            _id: req.params.id
        })
        res.render('admin/users/edit-user', {
            user: req.user,
            title: "Edit User",
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

//Admin Edit User
exports.adminEditUserByID = async function (req, res) {
   async function update(status, id) {
        await User.updateOne({
            _id: req.params.id
        }, {
            $set: {
                status: status,
            }
        }, )
    }
    var user = await User.findById(req.params.id)
    try {
        switch (req.params.status) {
            case "1":
                if (!update("Active", req.params.id)) {
                    req.flash('error', "Unable to update, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                await accountStatus(user.email.value, user.name, "Active");
                req.flash('success', "Updated Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
                break;
            case "0": 
                if (!update("Blocked", req.params.id)) {
                    req.flash('error', "Unable to update, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                await accountStatus(user.email.value, user.name, "Blocked");
                req.flash('success', "Updated Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
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

//View User by ID
exports.viewTripByUserByIdAndTripId = async function (req, res) {
    try {
        var getUser = await User.find({
            _id: req.params.user_id
        })
        var trip = await Trip.find({
            _id: req.params.trip_id,
            userId: req.params.user_id
        })
        // console.log(trips)
        res.render('admin/users/trip-details', {
            user: req.user,
            title: "View Trip Details",
            trip: trip,
            moment: moment,
            getUser: getUser,
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}