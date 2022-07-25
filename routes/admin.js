const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controller/admin');
const userController = require('../controller/admin/user');
const riderController = require('../controller/admin/rider');
const settingController = require('../controller/admin/setting');
const fleetController = require('../controller/admin/fleet');
const verificationController = require('../controller/admin/verification');
const transactionController = require('../controller/admin/transaction');
const resetPasswordController = require('../controller/admin/reset-password');
const tripController = require('../controller/admin/trip');
const couponController = require('../controller/admin/coupon');
const validation = require('../services/validations/admin/validation');
const middleware = require('../middleware/adminAuthCheker')

//for body parser
router.use(express.urlencoded({ extended: false }));
router.use(express.json())

//Create Admin
router.post('/admin', validation('create'), controller.create)

//Login Admin
router.get('/', controller.login)
router.get('/login', controller.login)
router.post('/login', validation('login'), controller.adminLogin, passport.authenticate('login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res) {
    res.redirect('/dashboard')
});

//Logout
router.get('/logout', controller.logout)

//Dashboard 
router.get('/dashboard', middleware.authenticate, controller.dashboard)

//Profile 
router.get('/profile', middleware.authenticate, settingController.profile)
router.post('/profile', middleware.authenticate, validation('update'), settingController.updateProfile)
router.post('/changePassword', middleware.authenticate, validation('password'), settingController.changePassword)

//App-Settings 
router.get('/app-settings', middleware.authenticate, settingController.appSettings)
router.post('/app-settings', middleware.authenticate, validation('appSettings'), settingController.saveAppSettings)

//Fleet Owners
router.get('/fleet-owners', middleware.authenticate, fleetController.fleets)

//Fleet Owners
router.get('/view-fleet/:id', middleware.authenticate, fleetController.viewFleetByID)

//Fleet Edit
router.get('/edit-fleet/:id', middleware.authenticate, fleetController.viewEditFleetByID)

//Edit Fleet
router.post('/admin-edit-fleet', middleware.authenticate, validation('updateFleet'), fleetController.adminEditFleetByID)

//Edit Veiw Fleet by ID
router.get('/fleet-status/:id/:status', middleware.authenticate, fleetController.adminEditFleetStatusByID)

//Verification
router.get('/verification', middleware.authenticate, verificationController.verification)


router.get('/admin-reset-password', resetPasswordController.adminResetPassword)
router.get('/reset-password/:token', resetPasswordController.resetPasswordLoad)
router.post('/reset-password', validation('resetPassword'), resetPasswordController.resetPasswordSave)

// User Routes

//Users
router.get('/users', middleware.authenticate, userController.allUsers)

//Veiw User by ID
router.get('/view-user/:id', middleware.authenticate, userController.viewUserByID)

//Edit Veiw User by ID
router.get('/user-status/:id/:status', middleware.authenticate, userController.adminEditUserByID)

//Edit Veiw User by ID
router.post('/admin-edit-user', middleware.authenticate, validation('updateUser'), userController.adminEditUserByID)

//Veiw Trip Details By User ID and Trip ID
router.get('/view-trip-detail/:user_id/:trip_id', middleware.authenticate, userController.viewTripByUserByIdAndTripId)



//Coupons
router.get('/coupon-codes', middleware.authenticate, couponController.index)

//Create new page
router.get('/create-coupon-codes', middleware.authenticate, couponController.create)

//Update toggle
router.post('/update-coupon-status', middleware.authenticate, couponController.updateStatus)

//Edit Coupon
router.get('/edit-coupon/:id', middleware.authenticate, couponController.edit)

//Edit save
router.post('/edit-coupon', middleware.authenticate, couponController.update)

//Create New
router.post('/create-coupon-codes', middleware.authenticate, validation('createCoupon'), couponController.createNew)

//All Riders
router.get('/riders', middleware.authenticate, riderController.getAllRiders)

//Veiw Rider by ID
router.get('/view-rider/:id', middleware.authenticate, riderController.viewRiderByID)

//Edit Veiw Rider by ID
router.get('/edit-rider/:id', middleware.authenticate, riderController.viewEditRiderByID)

//Edit Veiw User by ID
router.post('/admin-edit-rider', middleware.authenticate, validation('updateRider'), riderController.adminEditRiderByID)

//Veiw Trip Details By User ID and Trip ID
router.get('/rider-status/:id/:status', middleware.authenticate, riderController.adminEditRiderStatusByID)

//Veiw Trip Details By User ID and Trip ID
router.get('/rider-trip-detail/:rider_id/:trip_id', middleware.authenticate, riderController.viewTripByRiderByIdAndTripId)
// //Get Riders by status
// router.post('/admin-get-rider-by-status', middleware.authenticate, controller.getAllRiderByStatus)

// //Blocked Riders
// router.get('/blocked-riders', middleware.authenticate, controller.blockedRiders)

// //Deleted Riders
// router.get('/deleted-riders', middleware.authenticate, controller.deletedRiders)


//Transactions
router.get('/all-transactions', middleware.authenticate, transactionController.allTransactions)


//Trips
router.get('/all-trips', middleware.authenticate, tripController.allTrips)

//View Trip
router.get('/view-trip/:trip_id', middleware.authenticate, tripController.view)

//Forget Password
router.get('/forget-password', resetPasswordController.forgetPassword)

router.post('/forget-password', validation('uniqueEmail'), resetPasswordController.adminForgetPasswordSend)

//Change Admin Password By ID
router.patch('/admin-change-password', validation('password'), controller.updatePasswordById)

//Users
//Fetch All Users
router.get('/admin-users', controller.fetchAllUsers)

//Fetch One User By Id
router.get('/admin-userbyid/:id', controller.fetchOneUserById)

//Fetch One User By Email
router.get('/admin-userbyemail/:email', controller.fetchOneUserByEmail)

//Fetch One User By Mobile
router.get('/admin-userbymobile/:mobile', controller.fetchOneUserByMobile)

//Delete All Users
router.delete('/admin-users', controller.deleteAllUsers)

//Delete One User By Id
router.delete('/admin-user/:id', controller.deleteOneUserById)

//Activate One User By Id
router.get('/admin-activate-userbyid/:id', controller.activateOneUserById)

//Block One User By Id
router.get('/admin-block-userbyid/:id', controller.blockOneUserById)

//Riders
//Fetch All Riders
router.get('/admin-riders', controller.fetchAllRiders)

//Fetch One Rider By Id
router.get('/admin-riderbyid/:id', controller.fetchOneRiderById)

//Fetch One Rider By Email
router.get('/admin-riderbyemail/:email', controller.fetchOneRiderByEmail)

//Fetch One Rider By Mobile
router.get('/admin-riderbymobile/:mobile', controller.fetchOneRiderByMobile)

//All Online Riders
router.get('/admin-all-online-riders', controller.onlineRiders)

//Find Online Rider By Id
router.get('/admin-rider-online/:id', controller.findOnlineRiderById)

//Delete All Riders
router.delete('/admin-riders', controller.deleteAllRiders)

//Delete One Rider By Id
router.delete('/admin-rider/:id', controller.deleteOneRiderById)

//Approved One Rider By Id
router.get('/admin-approve-riderbyid/:id', controller.approveOneRiderById)

//Blocked One Rider By Id
router.get('/admin-block-riderbyid/:id', controller.blockOneRiderById)

//Pending One Rider By Id
router.get('/admin-pending-riderbyid/:id', controller.pendingOneRiderById)

//Fleet Owners
//Fetch All Fleet Owners
router.get('/admin-fleets', controller.fetchAllFleetOwners)

//Fetch One Fleet Owner By Id
router.get('/admin-fleetbyid/:id', controller.fetchOneFleetOwnerById)

//Fetch One Fleet Owner By Email
router.get('/admin-fleetbyemail/:email', controller.fetchOneFleetOwnerByEmail)

//Fetch One Fleet Owner By Mobile
router.get('/admin-fleetbymobile/:mobile', controller.fetchOneFleetOwnerByMobile)

//Delete All Fleet Owners
router.delete('/admin-fleets', controller.deleteAllFleetOwners)

//Delete One Fleet Owner By Id
router.delete('/admin-fleet/:id', controller.deleteOneFleetOwnerById)

//Approved One Fleet Owner By Id
router.get('/admin-approve-fleetbyid/:id', controller.approveOneFleetOwnerById)

//Blocked One Fleet Owner By Id
router.get('/admin-block-fleetbyid/:id', controller.blockOneFleetOwnerById)

//Pending One Fleet Owner By Id
router.get('/admin-pending-fleetbyid/:id', controller.pendingOneFleetOwnerById)

//Trips
//All Pending, Cancelled, Ongoing, and Accepted Trips
router.get('/admin-trip-history', controller.tripHistory);

//Completed Trips
router.get('/admin-completed-trips', controller.completedTrips);

//Get One Trips
router.get('/admin-get-trip-by-id/:tripId', controller.getTripById);

//Delete Trips
router.get('/admin-delete-trip-by-id/:tripId', controller.deleteOneTrips);

//Delete All Trips
router.delete('/admin-delete-trips', controller.deleteAllTrips);

//Delete All Online Riders
router.get('/admin-delete-online-riders', controller.deleteAllOnlineRider);

//System Settings
router.patch('/admin-update-setting', validation('settings'), controller.settings)

//Admin Forget Password
router.post('/admin-forget-password', validation('uniqueEmail'), controller.sendResetPasswordLink)

//Admin Reset Password Page
router.get('/admin-reset-password/:token', controller.resetPasswordPage)

//Admin Reset Password
router.post('/admin-reset-password', validation('resetPassword'), controller.resetPassword)

module.exports = router