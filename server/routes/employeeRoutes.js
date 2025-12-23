const express = require('express');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, changePassword, submitLeaveRequest, getMyLeaveRequests, getEmployeeDashboard, updateProfile, uploadProfilePhoto } = require('../controller/employeeController');
const { getMyDocuments, uploadMyDocument, getMySalarySlips, deleteSalarySlip, uploadMySalarySlip } = require('../controller/employeeDocumentController');

const router = express.Router();

// Configure multer for document uploads with sanitized filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/documents/'));
    },
    filename: (req, file, cb) => {
        // Sanitize filename by replacing spaces and special characters
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `doc_${Date.now()}_${sanitizedName}`);
    }
});

const upload = multer({ storage });
const profileUpload = multer({ dest: path.join(__dirname, '../../uploads/') });

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/dashboard', verifyToken, getEmployeeDashboard);
router.put('/change-password', verifyToken, changePassword);
router.post('/leave-requests', verifyToken, submitLeaveRequest);
router.get('/my-leave-requests', verifyToken, getMyLeaveRequests);
router.get('/documents', verifyToken, getMyDocuments);
router.post('/upload-document', verifyToken, upload.single('file'), uploadMyDocument);
router.post('/upload-profile-photo', verifyToken, profileUpload.single('profilePhoto'), uploadProfilePhoto);

// Salary slip routes
router.get('/salary-slips', verifyToken, getMySalarySlips);
router.post('/upload-salary-slip', verifyToken, upload.single('file'), uploadMySalarySlip);
router.delete('/salary-slips/:slipId', verifyToken, deleteSalarySlip);

module.exports = router;
