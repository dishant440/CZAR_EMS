const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId }).select('-workPassword');
    if (!employee) return res.status(404).json({ message: 'Profile not found' });
    res.json(employee);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password too short' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) return res.status(404).json({ message: 'Profile not found' });

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await new LeaveRequest({ employeeId: employee._id, leaveType, fromDate, toDate, days, reason }).save();
    res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get own leave requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) return res.status(404).json({ message: 'Profile not found' });

    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id }).sort({ appliedAt: -1 });
    res.json(leaveRequests);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
