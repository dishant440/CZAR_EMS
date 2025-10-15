const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const employeeRoutes = require('./employeeRoutes');
const holidayRoutes = require('./holidayRoutes');
const leaveRequestRoutes = require('./LeaveRequestRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/employee', employeeRoutes);
router.use('/holidays', holidayRoutes);
router.use('/leave-requests', leaveRequestRoutes);

module.exports = router;
