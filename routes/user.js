const express = require('express');
const router = express.Router();
const { verifyToken } = require('../auth/verifyToken');
const controller = require('../controller/user');
const validation = require('../services/validations/user/validation');

//for body parser
router.use(express.urlencoded({ extended: false }));
router.use(express.json())


//Coupon
router.post('/coupon', validation('activateCoupon'), controller.coupon)

//check if user have an active Coupon
router.get('/check-coupon/:userId', controller.checkActiveCoupon)

//Index
router.get('/index', controller.index)

//Login
router.post('/user-login', validation('login'), controller.isPasswordAndUserMatch)

//Create
router.post('/user', validation('createUser'), controller.create)

//Update
router.post('/user-update', validation('update'), controller.updateProfile)

//Fetch One By Id
router.get('/userbyid/:id', controller.fetchOneById)

//Fetch One By Email
router.get('/userbyemail/:email', controller.fetchOneByEmail)

//Fetch One By Mobile
router.get('/userbymobile/:mobile', controller.fetchOneByMobile)

//Change Password By ID
router.patch('/user-change-password', verifyToken, validation('password'), controller.updatePasswordById)

//Send Verification Code
router.post('/user-send-code', validation('sendCode'), controller.sendCode)

//Confirm Verification Code
router.post('/user-verify-code', validation('verifyCode'), controller.verifyCode)

//Create Trip
router.post('/user-create-trip', validation('createTrip'), controller.createTrip)

//Get User Location
router.post('/get-user-location', validation('getLocation'), controller.getCurrectLocation)

//Get User Location Details
router.post('/get-user-location-details', validation('getLocationDetails'), controller.getLocationDetails)

//Initiate Payment
router.post('/user-payment', verifyToken, validation('payment'), controller.initiatePayment)

//Confirm OTP
router.post('/user-confirm-otp', verifyToken, validation('checkOTP'), controller.getAndConfirmPaymentOTP)

//Refound Transaction
router.get('/user-refund-transaction/:id', controller.refundTransaction)

//Get All User Cards
router.get('/user-all-user-cards/:userId', verifyToken, controller.getAllUserCards)

//Set Default Payment Method
router.post('/user-default-payment-method', validation('defaultPaymentType'), controller.setDefaultPaymentMethod)

//Online Driver
router.get('/online-rider', controller.checkOnlineRider)

//Check Unique Mobile
router.post('/user-check-unique-mobile', validation('uniqueMobile'), controller.checkUniqueMobile)

//Check Unique Email
router.post('/user-check-unique-email', validation('uniqueEmail'), controller.checkUniqueEmail)

//Forget Password
router.post('/user-forget-password', validation('uniqueEmail'), controller.sendResetPasswordLink)

//Reset Password Page
router.get('/user-reset-password/:token', controller.resetPasswordPage)

//Reset Password
router.post('/user-reset-password', validation('resetPassword'), controller.resetPassword)

//Google Autocomplete
router.get('/user-address-autocomplete/:address', controller.autoComplete)

//Google Get Adrress Details By Place_ID
router.get('/user-address-by-place-id/:place_id', controller.getPlaceAddressByPlaceId)

//Trip History
router.get('/user-trip-history/:userId', controller.tripHistory)

//Completed Trips
router.get('/user-completed-trips/:userId', controller.completedTrips)

//Reset Password
router.post('/user-rate', validation('rate'), controller.rate)

//Check User Exist And Status
router.get('/user-check/:id', controller.checkUser)


module.exports = router