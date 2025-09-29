const express = require('express');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const { getUsers, createEmployee, updateEmployee, deleteEmployee, getLeaveRequests, reviewLeaveRequest } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', verifyToken, verifyAdmin, getUsers);
router.post('/employees', verifyToken, verifyAdmin, createEmployee);
router.put('/employees/:id', verifyToken, verifyAdmin, updateEmployee);
router.delete('/employees/:id', verifyToken, verifyAdmin, deleteEmployee);
router.get('/leave-requests', verifyToken, verifyAdmin, getLeaveRequests);
router.put('/leave-requests/:id', verifyToken, verifyAdmin, reviewLeaveRequest);

module.exports = router;
