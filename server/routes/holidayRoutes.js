const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getAllHolidays, getHolidaysByYear, addHoliday, updateHoliday, deleteHoliday } = require('../controller/holidayController');

const router = express.Router();

router.get('/', getAllHolidays);
router.get('/:year', verifyToken, getHolidaysByYear);
router.post('/addHoliday',  addHoliday);
router.put('/:id', verifyToken, verifyAdmin, updateHoliday);
router.delete('/:id', verifyToken, verifyAdmin, deleteHoliday);

module.exports = router;
