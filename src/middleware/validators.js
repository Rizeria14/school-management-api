const { body, query } = require('express-validator');


const addSchoolValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('School name is required.')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ min: 5, max: 500 }).withMessage('Address must be between 5 and 500 characters.'),

  body('latitude')
    .notEmpty().withMessage('Latitude is required.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90.'),

  body('longitude')
    .notEmpty().withMessage('Longitude is required.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180.'),
];


const listSchoolsValidation = [
  query('latitude')
    .notEmpty().withMessage('Latitude query parameter is required.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90.'),

  query('longitude')
    .notEmpty().withMessage('Longitude query parameter is required.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180.'),
];

module.exports = { addSchoolValidation, listSchoolsValidation };
