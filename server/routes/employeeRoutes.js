const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { getProfile, changePassword, submitLeaveRequest, getMyLeaveRequests } = require('../controllers/employeeController');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);
router.post('/leave-requests', verifyToken, submitLeaveRequest);
router.get('/my-leave-requests', verifyToken, getMyLeaveRequests);

module.exports = router;
