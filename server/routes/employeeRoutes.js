const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, changePassword, submitLeaveRequest, getMyLeaveRequests } = require('../controller/employeeController');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);
router.post('/leave-requests', verifyToken, submitLeaveRequest);
router.get('/my-leave-requests', verifyToken, getMyLeaveRequests);

module.exports = router;
