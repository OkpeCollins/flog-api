const express = require('express');
const router = express.Router();
const controller = require('../controller/fleet');
const validation = require('../services/validations/fleet/validation');

//for body parser
router.use(express.urlencoded({ extended: false }));
router.use(express.json())

//Login User
router.post('/fleet-login', validation('login'), controller.isPasswordAndFleetMatch)

//Create
router.post('/fleet', validation('create'), controller.create)

//Update Profile
router.post('/fleet-update', validation('update'), controller.updateProfile)

//Create Rider
router.post('/fleet-create-rider', validation('createRider'), controller.createRider)

//Fetch All
router.get('/fleets', controller.fetchAll)

//Check Fleet Owner Account status One By Id
router.get('/fleet-check/:id', controller.checkFleet)

//Fetch One By Id
router.get('/fleetbyid/:id', controller.fetchOneById)

//Fetch One By Email
router.get('/fleetbyemail/:email', controller.fetchOneByEmail)

//Fetch One By Mobile
router.get('/fleetbymobile/:mobile', controller.fetchOneByMobile)

//Delete All
router.delete('/fleets', controller.deleteAll)

//Delete One By Id
router.delete('/fleet/:id', controller.deleteOneById)

//Change Password By ID
router.patch('/fleet-change-password', validation('password'), controller.updatePasswordById)

//Send Verification Code
router.post('/fleet-send-code', validation('sendCode'), controller.sendCode)

//Confirm Verification Code
router.post('/fleet-verify-code', validation('verifyCode'), controller.verifyCode)

//Check Unique Mobile
router.post('/fleet-check-unique-mobile', validation('uniqueMobile'), controller.checkUniqueMobile)

//Check Unique Email
router.post('/fleet-check-unique-email', validation('uniqueEmail'), controller.checkUniqueEmail)

//Forget Password
router.post('/fleet-forget-password', validation('uniqueEmail'), controller.sendResetPasswordLink)

//Reset Password Page
router.get('/fleet-reset-password/:token', controller.resetPasswordPage)

//Reset Password
router.post('/fleet-reset-password', validation('resetPassword'), controller.resetPassword)

//Fleet Owner Home Page
router.get('/fleet-home-page/:fleetId', controller.homePage)

//All Fleet Owner Riders
router.get('/fleet-owner-riders/:fleetId', controller.allRiders)

//Fleet Owner Current Week Net Trips
router.get('/fleet-owner-current-week-net/:fleetId', controller.currentWeekNet)

//Fleet Owner Current Week Net Trips
router.get('/fleet-owner-three-months-net/:fleetId', controller.threeMonthsNet)

//Fleet Owner Previous Week Net Trips
router.get('/fleet-owner-previous-week-net/:fleetId', controller.previousWeekNet)

//Fleet Owner Current Week Revenue Trips
router.get('/fleet-owner-current-week-revenue-trips/:fleetId', controller.currentWeekRevenue)

//Fleet Owner Previous Week Revenue Trips
router.get('/fleet-owner-previous-week-revenue-trips/:fleetId', controller.previousWeekRevenue)

//Fleet Owner Three months Revenue Trips
router.get('/fleet-owner-three-months-revenue-trips/:fleetId', controller.threeMonthsRevenue)

//Fleet Owner Current Week Balance Trips
router.get('/fleet-owner-current-week-balance-trips/:fleetId', controller.currentWeekBalance)

//Fleet Owner Previous Week Balance Trips
router.get('/fleet-owner-previous-week-balance-trips/:fleetId', controller.previousWeekBalance)

//Fleet Owner Three Months Balance Trips
router.get('/fleet-owner-three-months-balance-trips/:fleetId', controller.threeMonthsBalance)

//All Transactions
router.get('/transactions', controller.allTransactions)

//Fetch Rider  details by ID
router.get('/fleet-fetch-rider-by-id/:id', controller.fetchOneRiderById)

//Fetch Rider  details by ID
router.get('/fleet-block-rider-by-id/:id', controller.blockOneRiderById)

//Fetch Rider  details by ID
router.get('/fleet-approve-rider-by-id/:id', controller.approveOneRiderById)

//Fetch Rider  details by ID
router.get('/fleet-delete-rider-by-id/:id', controller.deleteOneRiderById)

module.exports = router