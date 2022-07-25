const express = require('express');
const router = express.Router();
const {
    verifyToken
} = require('../auth/verifyToken');
const controller = require('../controller/rider');
const validation = require('../services/validations/rider/validation');
const authCheck = require('../middleware/riderTokenChecker')
const checkActiveRider = require('../middleware/checkActiveRider')



//for body parser
router.use(express.urlencoded({
    extended: false
}));
router.use(express.json())

//Auth Checker Middleware
router.use(authCheck)

//Active Rrider Middleware
router.use(checkActiveRider)
//Login Rider
router.post('/rider-login', validation('login'), controller.isPasswordAndRiderMatch)

//Logout Rider
router.get('/rider-logout', controller.logout)

//Create
router.post('/rider', validation('create'), controller.create)

//Update Profile
router.post('/rider-update', validation('update'), controller.updateProfile)

//Check Rider Account if Exit And If Status is Approved By Id
router.get('/rider-check/:id', controller.checkRider)

//Fetch One By Id
router.get('/riderbyid/:id', controller.fetchOneById)

//Fetch One By Email
router.get('/riderbyemail/:email', controller.fetchOneByEmail)

//Fetch One By Mobile
router.get('/riderbymobile/:mobile', controller.fetchOneByMobile)

//Delete All
router.delete('/riders', controller.deleteAll)

//Delete One By Id
router.delete('/rider/:id', controller.deleteOneById)

//Change Password By ID
router.patch('/rider-change-password', validation('password'), controller.updatePasswordById)

//Send Verification Code
router.post('/rider-send-code', validation('sendCode'), controller.sendCode)

//Confirm Verification Code
router.post('/rider-verify-code', validation('verifyCode'), controller.verifyCode)

//Go Online By Id
router.post('/rider-online', validation('goOnline'), controller.goOnline)

//Go Offline By Id
router.get('/rider-offline/:id', controller.goOffline)

//Accept Trip
router.post('/rider-accept-trip', validation('acceptTrip'), controller.acceptTrip)

//Check Unique Mobile
router.post('/rider-check-unique-mobile', validation('uniqueMobile'), controller.checkUniqueMobile)

//Check Unique Email
router.post('/rider-check-unique-email', validation('uniqueEmail'), controller.checkUniqueEmail)

//Forget Password
router.post('/rider-forget-password', validation('uniqueEmail'), controller.sendResetPasswordLink)

//Reset Password Page
router.get('/rider-reset-password/:token', controller.resetPasswordPage)

//Reset Password
router.post('/rider-reset-password', validation('resetPassword'), controller.resetPassword)

//Trip History
router.get('/rider-trip-history/:riderId', controller.tripHistory)

//Completed Trips
router.get('/rider-completed-trips/:riderId', controller.completedTrips)

//Current Week Net Trips
router.get('/rider-current-week-trips/:riderId', controller.currentWeekNet)

//Current Week Net Trips
router.get('/rider-three-months-trips/:riderId', controller.threeMonthsNet)

//Previous Week Net Trips
router.get('/rider-previous-week-trips/:riderId', controller.previousWeekNet)

//Current Week Revenue Trips
router.get('/rider-current-week-revenue-trips/:riderId', controller.currentWeekRevenue)

//Previous Week Revenue Trips
router.get('/rider-previous-week-revenue-trips/:riderId', controller.previousWeekRevenue)

//Three months Revenue Trips
router.get('/rider-three-months-revenue-trips/:riderId', controller.threeMonthsRevenue)

//Current Week Balance Trips
router.get('/rider-current-week-balance-trips/:riderId', controller.currentWeekBalance)

//Previous Week Balance Trips
router.get('/rider-previous-week-balance-trips/:riderId', controller.previousWeekBalance)

//Three Months Balance Trips
router.get('/rider-three-months-balance-trips/:riderId', controller.threeMonthsBalance)

//rider today earning and rating
router.get('/rider-today-earning-and-rating/:riderId', controller.todayEarningAndRating)

//Confirm Verification Code
router.post('/chat', validation('saveChat'), controller.saveChat)

//Fetch Chat By Trip Id
router.get('/get-chat-by-trip-id/:tripId', controller.fetchChat)

//Pay To Flog
router.get('/pay-to-flog', controller.flogAccount)

//Google Map Polyline
router.post('/polyline', validation('polyline'), controller.polyline)

router.get('/find/:id', controller.findUser)

router.get('/rider-test', controller.test)
router.get('/rider-cancel-trip/:trip_id', controller.cancelTrip)
router.get('/rider-find-driver/:trip_id', controller.findRiderAgain)
module.exports = router