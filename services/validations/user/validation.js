const {
    check,
    validationResult
} = require('express-validator');

module.exports = (method) => {
    switch (method) {
        case 'createUser': {
            return [
                check('name', 'Name is required').trim().escape().not().isEmpty()
                .isLength({
                    min: 3
                }).withMessage('Name must not less than 3 characters long')
                .isLength({
                    max: 40
                }).withMessage('Name must be less than 40 characters long'),
                check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                .isLength({
                    min: 14,
                    max: 14
                }).withMessage('Mobile must be 14 digit (+2348060373372)')
                .isNumeric().withMessage('Phone Number must be numeric'),
                check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                .isLength({
                    max: 50
                }).withMessage('Email must be less than 50 characters long'),
                check('password', 'Password is required').trim().escape().notEmpty()
                .isLength({
                    min: 6
                }).withMessage('Password must be minimum 5 length')
                .matches(/(?=.*?[A-Z])/).withMessage('Password must have at least one Uppercase')
                .matches(/(?=.*?[a-z])/).withMessage('Password must have at least one Lowercase')
                .matches(/(?=.*?[0-9])/).withMessage('Password must have at least one Number'),
            ]
        }
        break;

    case 'update': {
        return [
            check('name', 'Name is required').trim().escape().not().isEmpty()
            .isLength({
                min: 3
            }).withMessage('Full Name must not less than 3 characters long')
            .isLength({
                max: 40
            }).withMessage('Full Name must be less than 40 characters long'),
            check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
            .isLength({
                min: 14,
                max: 14
            }).withMessage('Mobile must be 14 digit (+2348060373372)')
            .isNumeric().withMessage('Phone Number must be numeric'),
            check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
            .isLength({
                max: 50
            }).withMessage('Email must be less than 50 characters long'),
            check('profilePictureMimeType', 'profilePictureMimeType is required').not().isEmpty(),
            check('profilePictureValue', 'profilePictureValue is required').not().isEmpty(),
            check('userId', 'userId is required').not().isEmpty()
        ]
    }
    break;
    case 'login': {
        return [
            check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
            .isLength({
                max: 50
            }).withMessage('Email must be less than 50 characters long'),
            check('password', 'Password is required').trim().escape().notEmpty()
        ]
    }
    break;
    case 'sendCode': {
        return [
            check('mobile', 'Phone number is required').not().isEmpty()
            .isNumeric().withMessage('Phone Number must be numeric'),
        ]
    }
    break;
    case 'activateCoupon': {
        return [
            check('code', 'Coupon Code is required').not().isEmpty(),
            check('userId', 'User ID is required').not().isEmpty(),
        ]
    }
    break;
    case 'verifyCode': {
        return [
            check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
            .isLength({
                max: 50
            }).withMessage('Email must be less than 50 characters long'),
            check('code', 'Code is required').not().isEmpty()
            .isNumeric().withMessage('Code must be numeric'),
            check('mobile', 'Phone number is required').not().isEmpty()
            .isNumeric().withMessage('Phone Number must be numeric'),
        ]
    }
    break;
    case 'password': {
        return [
            check('id', 'ID  is required').trim().escape().not().isEmpty(),
            check('currentPassword', 'Current Password  is required').trim().escape().not().isEmpty(),
            check('newPassword', 'New Password is required').trim().escape().notEmpty()
            .isLength({
                min: 6
            }).withMessage('New Password must be minimum 5 length')
            .matches(/(?=.*?[A-Z])/).withMessage('New Password must have at least one Uppercase')
            .matches(/(?=.*?[a-z])/).withMessage('New Password must have at least one Lowercase')
            .matches(/(?=.*?[0-9])/).withMessage('New Password must have at least one Number'),
            check('confirmPassword', 'Confirm Password is required').trim().escape().not().isEmpty().custom((value, {
                req
            }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirm Password does not match password');
                }
                return true;
            }),
        ]
    }
    break;
    case 'resetPassword': {
        return [
            check('id', 'ID  is required').trim().escape().not().isEmpty(),
            check('newPassword', 'New Password is required').trim().escape().notEmpty()
            .isLength({
                min: 6
            }).withMessage('New Password must be minimum 5 length')
            .matches(/(?=.*?[A-Z])/).withMessage('New Password must have at least one Uppercase')
            .matches(/(?=.*?[a-z])/).withMessage('New Password must have at least one Lowercase')
            .matches(/(?=.*?[0-9])/).withMessage('New Password must have at least one Number'),
            check('confirmPassword', 'Confirm Password is required').trim().escape().not().isEmpty().custom((value, {
                req
            }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirm Password does not match password');
                }
                return true;
            }),
        ]
    }
    break;
    case 'trip': {
        return [
            check('userId', 'User Id  is required').trim().escape().not().isEmpty(),
            check('locationLatitude', 'Location Latitude is required').trim().escape().notEmpty(),
            check('locationLongitude', 'Location Longitude is required').trim().escape().notEmpty(),
            check('destinationLatitude', 'Destination Latitude is required').trim().escape().notEmpty(),
            check('destinationLongitude', 'Destination Longitude is required').trim().escape().notEmpty(),
            check('description', 'Trip Description is required').notEmpty(),
            check('price', 'Trip Price is required').trim().escape().notEmpty(),
            check('ETA', 'ETA is required').trim().escape().notEmpty(),
            check('paymentType', 'Payment Type is required').trim().escape().notEmpty(),
            check('distance', 'Trip Distance is required').trim().escape().notEmpty(),
        ]
    }
    break;
    case 'getLocation': {
        return [
            check('latitude', 'Location Latitude required').trim().escape().not().isEmpty(),
            check('longitude', 'Location Longitude is required').trim().escape().notEmpty(),
        ]
    }
    break;
    case 'getLocationDetails': {
        return [
            check('originLatitude', 'Location Origin Latitude is required').trim().escape().not().isEmpty(),
            check('originLongitude', 'Location Origin Longitude is required').trim().escape().notEmpty(),
            check('destinationLatitude', 'Location Destination Latitude required').trim().escape().not().isEmpty(),
            check('destinationLongitude', 'Location Destination Longitude is required').trim().escape().notEmpty(),
        ]
    }
    break;
    case 'payment': {
        return [
            check('name', 'Full Name is required').trim().escape().not().isEmpty(),
            check('mobile', 'Mobile is required').trim().escape().not().isEmpty().isNumeric(),
            check('email', 'Email is required').trim().escape().not().isEmpty(),
            check('card', 'Card is required').trim().escape().not().isEmpty().isNumeric(),
            check('cvv', 'cvv is required').trim().escape().notEmpty().isNumeric(),
            check('expiry_year', 'Expire Year required').trim().escape().not().isEmpty().isNumeric(),
            check('expiry_month', 'Expire Month is required').trim().escape().notEmpty().isNumeric(),
        ]
    }
    break;
    case 'checkOTP': {
        return [
            check('userId', 'User ID is required').trim().escape().not().isEmpty(),
            check('otp', 'OTP is required').trim().escape().not().isEmpty().isNumeric(),
            check('flw_ref', 'flw_ref is required').trim().escape().not().isEmpty(),
        ]
    }
    break;
    case 'defaultPaymentType': {
        return [
            check('userId', 'User ID is required').trim().escape().not().isEmpty(),
            check('paymentId', 'Payment Method ID is required').trim().escape().not().isEmpty(),
        ]
    }
    break;
    case 'createTrip': {
        return [
            check('userId', 'User Id  is required').trim().escape().not().isEmpty(),
            check('description', 'Description is required').trim().escape().notEmpty(),
            check('originLatitude', 'Location Origin Latitude is required').trim().escape().not().isEmpty(),
            check('originLongitude', 'Location Origin Longitude is required').trim().escape().notEmpty(),
            check('destinationLatitude', 'Location Destination Latitude is required').trim().escape().not().isEmpty(),
            check('destinationLongitude', 'Location Destination Longitude is required').trim().escape().notEmpty(),
        ]
    }
    break;
    case 'rate': {
        return [
            check('userId', 'User Id is required').trim().escape().not().isEmpty(),
            check('tripId', 'Trip Id is required').trim().escape().not().isEmpty(),
            check('first', 'First is required').trim().escape().not().isEmpty(),
            check('second', 'Second is required').trim().escape().notEmpty(),
            check('third', 'Third is required').trim().escape().not().isEmpty(),
            check('fourth', 'Fourth is required').trim().escape().notEmpty(),
            check('fifth', 'Fifth is required').trim().escape().not().isEmpty(),
        ]
    }
    break;
    case 'uniqueMobile': {
        return [
            check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
            .isLength({
                min: 11,
                max: 11
            }).withMessage('Mobile must be 11 digit')
            .isNumeric().withMessage('Phone Number must be numeric'),
        ]
    }
    break;
    case 'uniqueEmail': {
        return [
            check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
            .isLength({
                max: 30
            }).withMessage('Email must be less than 50 characters long'),
        ]
    }
    break;
    default:
    }
}