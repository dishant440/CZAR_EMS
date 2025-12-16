const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getUsers, createEmployee, updateEmployee, deleteEmployee, getLeaveRequests, reviewLeaveRequest, getAdminDashboard, getAdminDetails, updateAdminProfile, changePassword, updateLeaveBalance, updateAllLeaveBalances, updateEmployeeProfile } = require('../controller/adminControlle');

const router = express.Router();

router.get('/all-employees', getUsers);
router.get('/admin-dashboard', getAdminDashboard)
router.get('/get-admin-details', getAdminDetails)
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.put('/update/:id', updateAdminProfile);
router.put('/change-password', verifyToken, changePassword);
router.delete('/employees/:id', deleteEmployee);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:id', reviewLeaveRequest);
router.put('/update-leave-balance/:id', updateLeaveBalance);
router.put('/update-all-leave-balances', updateAllLeaveBalances);
router.put('/update-employee/:id', verifyToken, updateEmployeeProfile);

module.exports = router;
