const { check, validationResult } = require('express-validator');

module.exports = (method) => {
    switch (method) {
        case 'create':
            {
                return [
                    check('companyName', 'Company Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Name must not less than 3 characters long')
                    .isLength({ max: 40 }).withMessage('Name must be less than 40 characters long'),
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('Mobile must be 14 digit (+2348060373372)')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('password', 'Password is required').trim().escape().notEmpty()
                    .isLength({ min: 6 }).withMessage('Password must be minimum 5 length')
                    .matches(/(?=.*?[A-Z])/).withMessage('Password must have at least one Uppercase')
                    .matches(/(?=.*?[a-z])/).withMessage('Password must have at least one Lowercase')
                    .matches(/(?=.*?[0-9])/).withMessage('Password must have at least one Number'),
                    check('city', 'City is required').trim().escape().not().isEmpty(),
                    check('RGNumber', 'RG Number is required').trim().escape().not().isEmpty(),
                    check('accountName', 'Account Name is required').trim().escape().not().isEmpty(),
                    check('accountNumber', 'Account Number is required').trim().escape().not().isEmpty(),
                    check('bankName', 'Bank Name is required').trim().escape().not().isEmpty(),
                ]
            }
            break;
        case 'update':
            {
                return [
                    check('companyName', 'companyName is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('companyName must not less than 3 characters long')
                    .isLength({ max: 40 }).withMessage('companyName must be less than 40 characters long'),
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('Mobile must be 14 digit (+2348060373372)')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('profilePictureMimeType', 'profilePictureMimeType is required').not().isEmpty(),
                    check('profilePictureValue', 'profilePictureValue is required').not().isEmpty(),
                    check('fleetId', 'Fleet ID is required').not().isEmpty()
                ]
            }
            break;
        case 'login':
            {
                return [
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('password', 'Password is required').trim().escape().notEmpty()
                ]
            }
            break;
        case 'sendCode':
            {
                return [
                    check('mobile', 'Phone number is required').not().isEmpty()
                    .isNumeric().withMessage('Phone Number must be numeric'),
                ]
            }
            break;
        case 'verifyCode':
            {
                return [
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('code', 'Code is required').not().isEmpty()
                    .isNumeric().withMessage('Code must be numeric'),
                    check('mobile', 'Phone number is required').not().isEmpty()
                    .isNumeric().withMessage('Phone Number must be numeric'),
                ]
            }
            break;
        case 'password':
            {
                return [
                    check('id', 'ID  is required').trim().escape().not().isEmpty(),
                    check('currentPassword', 'Current Password  is required').trim().escape().not().isEmpty(),
                    check('newPassword', 'New Password is required').trim().escape().notEmpty()
                    .isLength({ min: 6 }).withMessage('New Password must be minimum 5 length')
                    .matches(/(?=.*?[A-Z])/).withMessage('New Password must have at least one Uppercase')
                    .matches(/(?=.*?[a-z])/).withMessage('New Password must have at least one Lowercase')
                    .matches(/(?=.*?[0-9])/).withMessage('New Password must have at least one Number'),
                    check('confirmPassword', 'Confirm Password is required').trim().escape().not().isEmpty().custom((value, { req }) => {
                        if (value !== req.body.newPassword) {
                            throw new Error('Confirm Password does not match password');
                        }
                        return true;
                    }),
                ]
            }
            break;
        case 'resetPassword':
            {
                return [
                    check('id', 'ID  is required').trim().escape().not().isEmpty(),
                    check('newPassword', 'New Password is required').trim().escape().notEmpty()
                    .isLength({ min: 6 }).withMessage('New Password must be minimum 5 length')
                    .matches(/(?=.*?[A-Z])/).withMessage('New Password must have at least one Uppercase')
                    .matches(/(?=.*?[a-z])/).withMessage('New Password must have at least one Lowercase')
                    .matches(/(?=.*?[0-9])/).withMessage('New Password must have at least one Number'),
                    check('confirmPassword', 'Confirm Password is required').trim().escape().not().isEmpty().custom((value, { req }) => {
                        if (value !== req.body.newPassword) {
                            throw new Error('Confirm Password does not match password');
                        }
                        return true;
                    }),
                ]
            }
            break;
        case 'createRider':
            {
                return [
                    check('fullName', 'Full Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Full Name must not less than 3 characters long')
                    .isLength({ max: 40 }).withMessage('Full Name must be less than 40 characters long'),
                    check('fleetOwnerId', 'fleetOwnerId is required').trim().escape().not().isEmpty(),
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('Mobile must be 11 digit')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('password', 'Password is required').trim().escape().notEmpty()
                    .isLength({ min: 6 }).withMessage('Password must be minimum 5 length')
                    .matches(/(?=.*?[A-Z])/).withMessage('Password must have at least one Uppercase')
                    .matches(/(?=.*?[a-z])/).withMessage('Password must have at least one Lowercase')
                    .matches(/(?=.*?[0-9])/).withMessage('Password must have at least one Number'),
                    check('bikeManufacturer', 'Bike Manufacturer Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Bike Manufacturer Name must not less than 3 characters long')
                    .isLength({ max: 50 }).withMessage('Bike Manufacturer Name must be less than 40 characters long'),
                    check('bikeType', 'Bike Type is required').trim().escape().not().isEmpty(),
                    check('licensePlate', 'License Plate is required').trim().escape().not().isEmpty(),
                    check('bikeColor', 'Bike Color is required').trim().escape().not().isEmpty(),
                    check('riderDriverLicense', 'Rider Driver License is required').trim().escape().not().isEmpty(),
                    check('localGovernmentPaperMimeType', 'Local Government Paper MimeType is required').trim().escape().not().isEmpty(),
                    check('localGovernmentPaperValue', 'Local Government Value Paper is required').not().isEmpty(),
                    check('bikePaperMimeType', 'Bike Paper Mime Type is required').trim().escape().not().isEmpty(),
                    check('bikePaperValue', 'Bike Paper Value is required').not().isEmpty(),
                    // check('accountName', 'Account Name is required').trim().escape().not().isEmpty(),
                    // check('accountNumber', 'Account Number is required').trim().escape().not().isEmpty(),
                    // check('bankName', 'Bank Name is required').trim().escape().not().isEmpty(),
                    check('riderCardYear', 'Rider Card Year is required').trim().escape().not().isEmpty(),
                    check('riderCardMonth', 'Rider Card Month is required').trim().escape().not().isEmpty(),
                    check('riderCardDay', 'Rider Card Day is required').trim().escape().not().isEmpty(),
                ]
            }
            break;
        case 'uniqueMobile':
            {
                return [
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 11, max: 11 }).withMessage('Mobile must be 11 digit')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                ]
            }
            break;
        case 'uniqueEmail':
            {
                return [
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                ]
            }
            break;
        default:
    }
}