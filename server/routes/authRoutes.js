const express = require('express');
const { register, login } = require('../controller/authController');

const { adminLogin } = require("../controller/authController");
const router = express.Router();

router.post("/admin-login", adminLogin);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
