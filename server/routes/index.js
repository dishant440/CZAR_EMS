const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const employeeRoutes = require('./employeeRoutes');
const holidayRoutes = require('./holidayRoutes');
const leaveRequestRoutes = require('./LeaveRequestRoutes');
const attendanceRoute = require('./attendanceRoute')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin',verifyToken, adminRoutes);
router.use('/employee',verifyToken, employeeRoutes);
router.use('/holidays',verifyToken, holidayRoutes);
router.use('/leave-requests',verifyToken, leaveRequestRoutes);
router.use('/attendance', verifyToken, attendanceRoute);

module.exports = router;
