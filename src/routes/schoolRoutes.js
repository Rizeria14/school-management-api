const express = require('express');
const router = express.Router();

const { addSchool, listSchools } = require('../controllers/schoolController');
const { addSchoolValidation, listSchoolsValidation } = require('../middleware/validators');


router.post('/addSchool', addSchoolValidation, addSchool);


router.get('/listSchools', listSchoolsValidation, listSchools);

module.exports = router;
