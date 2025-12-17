const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getUsers, createEmployee, updateEmployee, deleteEmployee, getLeaveRequests, reviewLeaveRequest, getAdminDashboard, getAdminDetails, updateAdminProfile, changePassword, updateLeaveBalance, updateAllLeaveBalances, updateEmployeeProfile } = require('../controller/adminControlle');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.get('/all-employees', getUsers);
router.get('/admin-dashboard', getAdminDashboard)
router.get('/get-admin-details', getAdminDetails)
router.post('/employees', upload.single('profilephoto'), createEmployee);
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
