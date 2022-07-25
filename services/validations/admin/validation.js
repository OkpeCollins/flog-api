const {
    check,
    validationResult
} = require('express-validator');

module.exports = (method) => {
    switch (method) {
        case 'create': {
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
                    max: 30
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
                }).withMessage('Name must not less than 3 characters long')
                .isLength({
                    max: 40
                }).withMessage('Name must be less than 40 characters long'),
                check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                .isLength({
                    max: 30
                }).withMessage('Email must be less than 50 characters long'),
            ]
        }
        break;
    case 'login': {
        return [
            check('email', 'Email Address is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
            .isLength({
                max: 30
            }).withMessage('Email must be less than 50 characters long'),
            check('password', 'Password is required').trim().escape().notEmpty()
        ]
    }
    break;
    
    case 'createCoupon': {
        return [
            check('code', 'Coupon Code is required').trim().escape().notEmpty()
            .isLength({
                min: 3
            }).withMessage('Coupon Code must be at least 3 characters long')
            .isLength({
                max: 30
            }).withMessage('Coupon Code must not more than 30 characters long'),
            check('percentage', 'Coupon Code Precentage discount is required').trim().notEmpty()
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

    case 'updateUser': {
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
            check('status', 'Account Status is required').trim().escape().not().isEmpty(),
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
    case 'settings': {
        return [
            check('TWILIOACCOUNTSID', 'TWILIO ACCOUNTSID is required').trim().escape().not().isEmpty(),
            check('TWILIOSERVICE_SID', 'TWILIO SERVICE_SID is required').trim().escape().notEmpty(),
            check('TWILIOAUTHTOKEN', 'TWILIO AUTHTOKEN is required').trim().escape().not().isEmpty(),
            check('TWILIOCHANNEL', 'TWILIO CHANNEL is required').trim().escape().notEmpty(),
            check('googgleMapAPI', 'Googgle Map API is required').trim().escape().notEmpty(),
            check('tripPricePerKilometer', 'Trip Price Per Kilometer is required').trim().escape().notEmpty(),
            check('tripFixedPrice', 'Trip Fixed Price is required').trim().escape().notEmpty(),
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

    case 'updateRider': {
        return [
            check('id', 'ID is required').trim().escape(),
            check('nmanu', 'Bike Manufacturer Name is required').trim().escape()
            .isLength({ min: 0 }).withMessage('Bike Manufacturer Name must not less than 3 characters long')
            .isLength({ max: 50 }).withMessage('Bike Manufacturer Name must be less than 40 characters long'),
            check('btype', 'Bike Type is required').trim().escape(),
            check('blicense', 'License Plate is required').trim().escape(),
            check('bcolor', 'Bike Color is required').trim().escape(),
            check('briderlicense', 'Rider Driver License is required').trim().escape(),
            check('lga', 'Local Government Paper is required').trim().escape(),
            check('bpaper', 'Bike Paper is required').trim().escape(),
            check('accname', 'Account Name is required').trim().escape(),
            check('accnum', '').trim().escape(),
            check('bank', 'Bank Name is required').trim().escape(),
            check('rcy', 'Rider Card Year is required').trim().escape(),
            check('rcm', 'Rider Card Month is required').trim().escape(),
            check('rcd', 'Rider Card Day is required').trim().escape(),
            check('gname', 'Guarantor Name Day is required').trim().escape(),
            check('gmobile', 'Guarantor Mobile is required').trim().escape()
            .isLength({ min: 0, max: 14 }).withMessage('Guarantor Mobile must be 14 digit (+2348060373372)'),
            check('goccupation', 'Guarantor Occupation Day is required').trim().escape(),
            check('grelationship', 'Guarantor Relationship Day is required').trim().escape(),
            check('gaddress', 'Guarantor Address is required').trim().escape(),
            check('gpicture', 'Guarantor Photo is required').trim().escape(),
        ]
    }
    break;
    case 'updateFleet': {
        return [
            check('id', 'ID is required').trim().escape(),
            check('city', 'City is required').trim().escape(),
            check('RGNumber', 'RG Number is required').trim().escape(),
            check('accountName', 'Account Name is required').trim().escape(),
            check('accountNumber', 'Account Number is required').trim().escape(),
            check('bankName', 'Bank Name is required').trim().escape(),
        ]
    }
    break;
    case 'appSettings': {
        return [
            check('ACCOUNTSID', 'Twilio ACCOUNTSID is required').trim().escape().notEmpty(),
            check('SERVICE_SID', 'Twilio SERVICE_SID is required').trim().escape().notEmpty(),
            check('AUTHTOKEN', 'Twilio AUTHTOKEN is required').trim().escape().notEmpty(),
            check('pricePerKilometer', 'Trip Price Per Kilometer is required').trim().escape().notEmpty(),
            check('fixedPrice', 'Trip Fixed Price is required').trim().escape().notEmpty(),
            check('publicKey', 'Flutterwave Public Key is required').trim().escape().notEmpty(),
            check('encryptionKey', 'Flutterwave Encryption Key is required').trim().escape().notEmpty(),
            check('secretKey', 'Flutterwave Secret Key is required').trim().escape().notEmpty(),
            check('googgleMap_api', 'Google Map API is required').trim().escape().notEmpty(),
            check('number', 'Account Number is required').trim().escape().notEmpty(),
            check('name', 'Account Name is required').trim().escape().notEmpty(),
            check('bank', 'Bank Name is required').trim().escape().notEmpty(),
        ]
    }
    break;
    default:
    }
}