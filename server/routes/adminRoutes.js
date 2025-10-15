const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getUsers, createEmployee, updateEmployee, deleteEmployee, getLeaveRequests, reviewLeaveRequest, getAdminDashboard } = require('../controller/adminControlle');

const router = express.Router();

router.get('/users', verifyToken, verifyAdmin, getUsers);
router.get('/admin-dashboard', getAdminDashboard)
router.post('/employees', verifyToken, verifyAdmin, createEmployee);
router.put('/employees/:id', verifyToken, verifyAdmin, updateEmployee);
router.delete('/employees/:id', verifyToken, verifyAdmin, deleteEmployee);
router.get('/leave-requests', verifyToken, verifyAdmin, getLeaveRequests);
router.put('/leave-requests/:id', verifyToken, verifyAdmin, reviewLeaveRequest);

module.exports = router;
