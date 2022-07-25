const {
    check,
    validationResult
} = require('express-validator');
const Fleet = require('../../models/fleet');
const Rider = require('../../models/rider');
const OnlineRider = require('../../models/onlineRider');
const Trip = require('../../models/trip')
const Transaction = require('../../models/transaction');
const accountStatus = require("../../utils/accountStatus");
const moment = require("moment");
const {
    exit
} = require('process');


//Active Riders
exports.getAllRiders = async function (req, res) {
    try {
        var onlineRiders = []
        var onlineRidersID = await OnlineRider.find({"status":"Active"}).select(['riderId', 'trips', 'destination', '-_id']);
        for (var i = 0; i < onlineRidersID.length; i++) {
            let countTrips = await OnlineRider.aggregate(
                [{
                    $match: {
                        "riderId": onlineRidersID[i].riderId
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
                ]
            );
            let riderName = await Rider.findOne({
                _id: onlineRidersID[i].riderId
            }).select(["fullName", "-_id"])
            var myArray = { id: onlineRidersID[i].riderId, name: riderName.fullName, destination: onlineRidersID[i].destination.text, trips: countTrips }
            onlineRiders.push(myArray)
        }

        var approvedRiders = await Rider.find(
            {
                "status.account": "Approved"
            }).select("-password").sort({
                'createdAt': -1
            })
        var pendingRiders = await Rider.find({
            "status.account": "Pending"
        }).select("-password").sort({
            'createdAt': -1
        })
        var deletedRiders = await Rider.find({
            "status.account": "Deleted"
        }).select("-password").sort({
            'createdAt': -1
        })
        var blockedRiders = await Rider.find({
            "status.account": "Blocked"
        }).select("-password").sort({
            'createdAt': -1
        })
        res.render('admin/riders/index', {
            user: req.user,
            title: "Riders",
            moment: moment,
            onlineRiders: onlineRiders,
            approvedRiders: approvedRiders,
            blockedRiders: blockedRiders,
            deletedRiders: deletedRiders,
            pendingRiders: pendingRiders,
            sn: 1,
            sn2: 1,
            sn3: 1,
            sn4: 1,
            sn5: 1,
        })
    } catch (error) {
        req.flash('error', error)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View Rider by ID
exports.viewRiderByID = async function (req, res) {
    try {
        var getUser = await Rider.findOne({
            _id: req.params.id
        })
        var userTransactions = await Transaction.find({
            "riderData.id": getUser._id
        }).sort({
            'createdAt': -1
        })
        // console.log(userTransactions)
        // console.log(getUser._id)
        var trips = await Trip.find({
            riderId: getUser._id
        }).sort({
            'createdAt': -1
        })
        var fleet = '';
        if (getUser.fleetOwnerData.fleetOwn) {
            var fleet = await Fleet.findOne({
                _id: getUser.fleetOwnerData.fleetOwnerId
            }).select("-password")
        }
        var earningData = []
        var earningData2 = []
        var riderId = getUser._id
        var months = ['January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        var days = [1, 2, 3]
        // var firstMonthPay = 0
        // var date = new Date();
        // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        // var lastDay = new Date(date.

        function firstDay(day) {
            var d = new Date();
            m = d.getMonth() + day; //current month
            y = d.getFullYear(); //current year
            return new Date(y, m, +2).toISOString().split('T')[0];
        }

        function lastDay(day) {
            var d = new Date();
            m = d.getMonth(); //current month
            y = d.getFullYear(); //current year
            return new Date(y, m + day, 1).toISOString().split('T')[0]
        }

        console.log(firstDay(12))
        // var secondMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${secondMonthLastDay}T23:59:59.999Z`
        //     },
        // });

        // function month(months, day) {
        //     console.log(months[new Date().getMonth() + day])
        //     // return  months[new Date().getMonth() + day]
        // }
        // // console.log(lastDay(2).getMonth())
        // month(months, -9)

        // firstDay(11)
        // lastDay(12)

        // console.log(firstDay, lastDay);
        async function monthNow(day) {
            var month = await Transaction.find({
                "riderData.id": riderId,
                createdAt: {
                    $gte: `${firstDay(day)}T00:00:00.000Z`,
                    $lt: `${lastDay(day + 1)}T23:59:59.999Z`
                },
                status: "Completed",
                paymentStatus: "Paid",
                paymentType: "Cash"
            }).select('price -_id')
            // var monthPay = 0;
            // for (var i = 0; i < month.length; i++) {
            //     console.log(month[i])
            //     // monthPay += parseInt(month[i].price);
            //     // console.log(month[i], monthPay);
            //     // earningData.push(monthPay)
            // }
            console.log(month)
        }

        monthNow(0)
        // console.log(earningData);
        // for (let index = 0; index < days.length; index++) {
        //     const element = days[index];
        //     var month = await Transaction.find({
        //         "riderData.id": riderId,
        //         createdAt: {
        //             $gte: `${firstDay(index)}T00:00:00.000Z`,
        //             $lt: `${lastDay(index+1)}T23:59:59.999Z`
        //         },
        //         status: "Completed",
        //         paymentStatus: "Paid",
        //         paymentType: "Cash"
        //     }).select('price -_id')
        //     var monthPay = 0;
        //     // console.log(month.price);
        //     for(var i = 0; i < month.length; i++){
        //         monthPay += parseInt(month[i].price);
        //         console.log(month[i], monthPay);
        //         earningData2.push(monthPay)
        //     }
        //     earningData.push(month)
        // }

        // var monthPay = 0;
        // for(var i = 0; i < earningData.length; i++){
        //     for(var j = 0; j < earningData[i].length; j++){
        //         monthPay += parseInt(earningData[i][j].price);        
        //         console.log(earningData[i][j].price, 'goo', monthPay);
        //     }
        //     console.log(earningData[i].length, earningData[i])
        // }
        // earningData.forEach(element2 => {
        //     console.log(element2)
        //     for (let index = 0; index < element2.length; index++) {
        //         const element = element2[index];
        //         monthPay += parseInt(element2[index].price);
        //         console.log(element)
        //         earningData2.push(monthPay)            
        //     }          
        // });

        // console.log(earningData2);

        // var firstMonthPay = 0;
        // for (var i = 0; i < firstMonth.length; i++) {
        //     firstMonthPay += parseInt(firstMonth[i].price);
        // }

        // var secondMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${secondMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${secondMonthLastDay}T23:59:59.999Z`
        //     },
        //     status: "Completed",
        //     paymentStatus: "Paid",
        //     paymentType: "Cash"
        // }).select('price -_id')

        // var secondMonthPay = 0;
        // for (var i = 0; i < secondMonth.length; i++) {
        //     secondMonthPay += parseInt(secondMonth[i].price);
        // }

        // var thirdMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${thirdMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${thirdMonthLastDay}T23:59:59.999Z`
        //     },
        //     status: "Completed",
        //     paymentStatus: "Paid",
        //     paymentType: "Cash"
        // }).select('price -_id')
        // var thirdMonthPay = 0;
        // for (var i = 0; i < thirdMonth.length; i++) {
        //     thirdMonthPay += parseInt(thirdMonth[i].price);
        // }

        // var fourthMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${fourthMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${fourthMonthLastDay}T23:59:59.999Z`
        //     },
        //     status: "Completed",
        //     paymentStatus: "Paid",
        //     paymentType: "Cash"
        // }).select('price -_id')

        // var fourthMonthPay = 0;
        // for (var i = 0; i < fourthMonth.length; i++) {
        //     fourthMonthPay += parseInt(fourthMonth[i].price);
        // }

        // var fifthMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${fifthMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${fifthMonthLastDay}T23:59:59.999Z`
        //     },
        //     status: "Completed",
        //     paymentStatus: "Paid",
        //     paymentType: "Cash"
        // }).select('price -_id')

        // var fifthMonthPay = 0;
        // for (var i = 0; i < fifthMonth.length; i++) {
        //     fifthMonthPay += parseInt(fifthMonth[i].price);
        // }

        // var sixthMonth = await Transaction.find({
        //     "riderData.id": riderId,
        //     createdAt: {
        //         $gte: `${sixthMonthFirstDay}T00:00:00.000Z`,
        //         $lt: `${sixthMonthLastDay}T23:59:59.999Z`
        //     },
        //     status: "Completed",
        //     paymentStatus: "Paid",
        //     paymentType: "Cash"
        // }).select('price -_id')

        // var sixthMonthPay = 0;
        // for (var i = 0; i < sixthMonth.length; i++) {
        //     sixthMonthPay += parseInt(sixthMonth[i].price);
        // }

        // var firstThreeMonthPay = firstMonthPay + secondMonthPay + thirdMonthPay;
        // var lastThreeMonthPay = fourthMonthPay + fifthMonthPay + sixthMonthPay;
        // var data = {
        //     "firstThreeMonthPay": parseFloat(firstThreeMonthPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        //     "lastThreeMonthPay": parseFloat(lastThreeMonthPay * 0.10).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
        // }
        // console.log(getUser)
        res.render('admin/riders/view-rider', {
            user: req.user,
            title: "View Rider",
            trips: trips,
            moment: moment,
            getUser: getUser,
            fleet: fleet,
            sn: 1,
            sn2: 2,
            userTransactions: userTransactions
        })
    } catch (error) {
        req.flash('error', error.message)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}
//View User by ID
exports.viewEditRiderByID = async function (req, res) {
    try {
        var getUser = await Rider.find({
            _id: req.params.id
        })
        res.render('admin/riders/edit-rider', {
            user: req.user,
            title: "Edit Rider",
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
//Admin Edit Rider
exports.adminEditRiderByID = async function (req, res) {
    try {
        console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', 'all fields are required')
            backURL = req.header('Referer')
            res.redirect(backURL)
        } else {
            function getExtension(filename) {
                return 'image/' + filename.split('.').pop();
            }
            var rider = await Rider.findOne({
                _id: req.body.id
            })
            if (!rider) {
                req.flash('warning', 'Rider not found')
                backURL = '/riders' || req.header('Referer')
                res.redirect(backURL)

            }
            if (req.files && req.files.gpicture) {
                var guarantorPhotoMimmeType = getExtension(req.files.gpicture.name)
                var guarantorPhotoValue = req.files.gpicture.data.toString('base64')
            } else if (rider.guarantor.photo.value) {
                var guarantorPhotoMimmeType = rider.guarantor.photo.mimeType
                var guarantorPhotoValue = rider.guarantor.photo.value
            } else {
                var guarantorPhotoMimmeType = null
                var guarantorPhotoValue = null
            }


            if (req.files && req.files.lga) {
                var bikeLocalGovernmentPaperMimetype = getExtension(req.files.lga.name)
                var bikeLocalGovernmentPaperValue = req.files.lga.data.toString('base64')
            } else if (rider.bike.localGovernmentPaper.value) {
                var bikeLocalGovernmentPaperMimetype = rider.bike.localGovernmentPaper.mimeType
                var bikeLocalGovernmentPaperValue = rider.bike.localGovernmentPaper.value
            } else {
                var bikeLocalGovernmentPaperMimetype = null
                var bikeLocalGovernmentPaperValue = null
            }

            if (req.files && req.files.bpaper) {
                var bikeBikePaperMimeType = getExtension(req.files.bpaper.name).substr(6)
                var bikeBikePaperValue = req.files.bpaper.data.toString('base64')
            } else if (rider.bike.bikePaper.value) {
                var bikeBikePaperMimeType = rider.bike.bikePaper.mimeType
                var bikeBikePaperValue = rider.bike.bikePaper.value
            } else {
                var bikeBikePaperMimeType = null
                var bikeBikePaperValue = null
            }

            console.log(bikeBikePaperMimeType);
            await Rider.updateOne({
                _id: req.body.id
            }, {
                $set: {
                    "accountDetails.accountName": req.body.accname,
                    "accountDetails.accountNumber": req.body.accnum,
                    "accountDetails.bankName": req.body.bank,
                    "guarantor.name": req.body.gname,
                    "guarantor.mobile": req.body.gmobile,
                    "guarantor.occupation": req.body.goccupation,
                    "guarantor.relationship": req.body.grelationship,
                    "guarantor.photo.value": guarantorPhotoValue,
                    "guarantor.photo.mimeType": guarantorPhotoMimmeType,
                    "guarantor.address": req.body.gaddress,
                    "bike.bikeManufacturer": req.body.bmanu,
                    "bike.bikeType": req.body.btype,
                    "bike.bikeColor": req.body.bcolor,
                    "bike.licensePlate": req.body.blicense,
                    "bike.localGovernmentPaper.mimeType": bikeLocalGovernmentPaperMimetype,
                    "bike.localGovernmentPaper.value": bikeLocalGovernmentPaperValue,
                    "bike.riderCardDetails.year": req.body.rcy,
                    "bike.riderCardDetails.month": req.body.rcm,
                    "bike.riderCardDetails.day": req.body.rcd,
                    "bike.bikePaper.mimeType": bikeBikePaperMimeType,
                    "bike.bikePaper.value": bikeBikePaperValue,
                    "bike.riderDriverLicense": req.body.briderlicense,
                }
            }, {
                multi: false
            })
                .then(result => {
                    console.log(result)
                    req.flash('success', "Profile Updated Successfully")
                    backURL = '/view-rider/' + rider._id || req.header('Referer')
                    res.redirect(backURL)
                })
                .catch(error => {
                    console.log(error)
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

exports.adminEditRiderStatusByID = async function (req, res) {
    var rider = await Rider.findById(req.params.id)
    async function update(status, id) {
        await Rider.updateOne({
            _id: req.params.id
        }, {
            $set: {
                "status.account": status,
            }
        })
    }
    try {
        switch (req.params.status) {
            case "1":
                if (!update("Approved", req.params.id)) {
                    req.flash('error', "Unable to update, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                await accountStatus(rider.email.value, rider.fullName, "Approved");
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
                await accountStatus(rider.email.value, rider.fullName, "Blocked");
                req.flash('success', "Updated Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
                break;
            case "2":
                if (!update("Deleted", req.params.id)) {
                    req.flash('error', "Unable to update, try again!")
                    backURL = req.header('Referer')
                    res.redirect(backURL)
                }
                await accountStatus(rider.email.value, rider.fullName, "Deleted");
                req.flash('success', "Updated Successfully")
                backURL = req.header('Referer')
                res.redirect(backURL)
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error)
        req.flash('error', error.Message)
        backURL = req.header('Referer') || '/dashboard';
        res.redirect(backURL);
    }
}

//View User by ID
exports.viewTripByRiderByIdAndTripId = async function (req, res) {
    try {
        var getUser = await Rider.find({
            _id: req.params.rider_id
        })
        var trip = await Trip.find({
            _id: req.params.trip_id,
            riderId: req.params.rider_id
        }).sort({
            'createdAt': -1
        })
        // console.log(trips)
        res.render('admin/riders/trip-details', {
            user: req.user,
            title: "Rider View Trip Details",
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