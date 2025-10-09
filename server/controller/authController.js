const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../model/userModel');
const Employee = require('../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required' });

    if (!validator.isEmail(email))
      return res.status(400).json({ message: 'Invalid email' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password too short' });

    if (!['admin', 'employee'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({ name, email, password: hashedPassword, role }).save();

    if (role === 'employee') {
      await new Employee({
        employeeId: `EMP${Date.now()}`,
        name,
        personalEmail: email,
        workEmail: email,
        dateOfBirth: new Date(),
        dateOfJoining: new Date(),
        availableLeaves: 20,
        department: 'General',
        position: 'Employee',
        workPassword: password,
        userId: user._id
      }).save();
    }

    const token = jwt.sign({ userId: user._id, email, role }, process.env.JWT_SECRET || 'czarcore_secret_key', { expiresIn: '24h' });

    res.status(201).json({ message: `${role} registered successfully`, token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email, role: user.role }, process.env.JWT_SECRET || 'czarcore_secret_key', { expiresIn: '24h' });

    res.json({ message: 'Login successful', token, user });
  } catch {
    res.status(500).json({ message: 'Server error during login' });
  }
};
