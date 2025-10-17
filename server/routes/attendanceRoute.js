const express = require('express');
const router = express.Router();
const {createAttendance} = require('../controller/attendanceController')



router.post('/upload',createAttendance);

module.exports = router