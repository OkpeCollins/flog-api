const { check, validationResult } = require('express-validator');

module.exports = (method) => {
    switch (method) {
        case 'create':
            {
                return [
                    check('fullName', 'Full Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Full Name must not less than 3 characters long')
                    .isLength({ max: 40 }).withMessage('Full Name must be less than 40 characters long'),
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
                    check('bikeManufacturer', 'Bike Manufacturer Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Bike Manufacturer Name must not less than 3 characters long')
                    .isLength({ max: 50 }).withMessage('Bike Manufacturer Name must be less than 40 characters long'),
                    check('bikeType', 'Bike Type is required').trim().escape().not().isEmpty(),
                    check('licensePlate', 'License Plate is required').trim().escape().not().isEmpty(),
                    check('bikeColor', 'Bike Color is required').trim().escape().not().isEmpty(),
                    check('riderDriverLicense', 'Rider Driver License is required').trim().escape().not().isEmpty(),
                    check('localGovernmentPaperMimeType', 'Local Government Paper MimeType is required').not().isEmpty(),
                    check('localGovernmentPaperValue', 'Local Government Value Paper is required').not().isEmpty(),
                    check('ridersCardValue', 'Rider Card Value Paper is required').not().isEmpty(),
                    check('ridersCardMimeType', 'Rider Card Mime Type is required').not().isEmpty(),
                    check('bikePaperMimeType', 'Bike Paper Mime Type is required').not().isEmpty(),
                    check('bikePaperValue', 'Bike Paper Value is required').not().isEmpty(),
                    check('accountName', 'Account Name is required').trim().escape().not().isEmpty(),
                    check('accountNumber', 'Account Number is required').trim().escape().not().isEmpty().isNumeric(),
                    check('bankName', 'Bank Name is required').trim().escape().not().isEmpty(),
                    check('riderCardYear', 'Rider Card Year is required').trim().escape().not().isEmpty(),
                    check('riderCardMonth', 'Rider Card Month is required').trim().escape().not().isEmpty(),
                    check('riderCardDay', 'Rider Card Day is required').trim().escape().not().isEmpty(),
                    check('guarantorName', 'guarantorName Day is required').trim().escape().not().isEmpty(),
                    check('guarantorMobile', 'guarantorMobile is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('guarantorName must be 14 digit (+2348060373372)'),
                    check('guarantorOccupation', 'guarantorOccupation Day is required').trim().escape().not().isEmpty(),
                    check('guarantorRelationship', 'guarantorRelationship Day is required').trim().escape().not().isEmpty(),
                    check('guarantorAddress', 'guarantorAddress is required').trim().escape().not().isEmpty(),
                    check('guarantorPhotoMimeType', 'guarantorPhotoMimeType is required').not().isEmpty(),
                    check('guarantorPhotoValue', 'guarantorPhotoValue is required').not().isEmpty(),
                ]
            }
            break;

        case 'update':
            {
                return [
                    check('fullName', 'Full Name is required').trim().escape().not().isEmpty()
                    .isLength({ min: 3 }).withMessage('Full Name must not less than 3 characters long')
                    .isLength({ max: 40 }).withMessage('Full Name must be less than 40 characters long'),
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('Mobile must be 14 digit (+2348060373372)')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
                    .isLength({ max: 50 }).withMessage('Email must be less than 50 characters long'),
                    check('profilePictureMimeType', 'profilePictureMimeType is required').not().isEmpty(),
                    check('profilePictureValue', 'profilePictureValue is required').not().isEmpty(),
                    check('riderId', 'riderId is required').not().isEmpty()
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
                    check('code', 'Code is required').not().isEmpty()
                    .isNumeric().withMessage('Code must be numeric'),
                    check('mobile', 'Phone number is required').not().isEmpty()
                    .isNumeric().withMessage('Phone Number must be numeric'),
                    check('email', 'Email is required').trim().escape().not().isEmpty().isEmail().normalizeEmail().withMessage('Your email is not valid')
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
        case 'acceptTrip':
            {
                return [
                    check('tripId', 'Trip ID is required').not().isEmpty(),
                    check('riderId', 'Rider ID is required').not().isEmpty()
                ]
            }
            break;
        case 'uniqueMobile':
            {
                return [
                    check('mobile', 'Phone Number is required').trim().escape().not().isEmpty()
                    .isLength({ min: 14, max: 14 }).withMessage('Mobile must be 14 digit')
                    .isNumeric().withMessage('Phone Number must be numeric'),
                ]
            }
            break;
        case 'polyline':
            {
                return [
                    check('originLatitude', 'Location Origin Latitude is required').trim().escape().not().isEmpty(),
                    check('originLongitude', 'Location Origin Longitude is required').trim().escape().notEmpty(),
                    check('destinationLatitude', 'Location Destination Latitude required').trim().escape().not().isEmpty(),
                    check('destinationLongitude', 'Location Destination Longitude is required').trim().escape().notEmpty(),
                ]
            }
            break;
        case 'goOnline':
            {
                return [
                    check('userId', 'User ID is required').trim().escape().not().isEmpty(),
                    check('destinationText', 'destinationText is required').trim().escape().not().isEmpty(),
                    check('destinationLongitude', 'destinationLongitude is required').trim().escape().not().isEmpty(),
                    check('destinationLatitude', 'destinationLatitude is required').trim().escape().not().isEmpty()
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
        case 'saveChat':
            {
                return [
                    check('tripId', 'Trip ID  is required').trim().escape().not().isEmpty(),
                    check('userId', 'User ID is required').trim().escape().notEmpty(),
                    check('userName', 'User Name is required').notEmpty(),
                    check('text', 'text is required').notEmpty(),
                ]
            }
            break;
        default:
    }
}