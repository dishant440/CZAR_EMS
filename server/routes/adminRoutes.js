const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getUsers, createEmployee, updateEmployee, deleteEmployee, getLeaveRequests, reviewLeaveRequest, getAdminDashboard, getAdminDetails } = require('../controller/adminControlle');

const router = express.Router();

router.get('/all-employees', getUsers);
router.get('/admin-dashboard', getAdminDashboard)
router.get('/get-admin-details', getAdminDetails)
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:id', reviewLeaveRequest);

module.exports = router;
