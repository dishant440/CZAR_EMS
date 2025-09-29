const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const { sendEmail } = require('../services/emailService');

// Admin: Get all employees
exports.getUsers = async (req, res) => {
  try {
    const employees = await Employee.find().select('-workPassword');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, personalEmail, dateOfBirth, dateOfJoining, department, position, employeeId } = req.body;

    if (!name || !personalEmail || !dateOfBirth || !dateOfJoining || !department || !position || !employeeId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Unique ID check
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const workEmail = `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`;

    const dob = new Date(dateOfBirth);
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    const workPassword = `${day}${month}${year}`;

    const hashedPassword = await bcrypt.hash(workPassword, 12);
    const user = await new User({ name, email: workEmail, password: hashedPassword, role: 'employee' }).save();

    const employee = await new Employee({
      employeeId,
      name,
      personalEmail,
      workEmail,
      dateOfBirth,
      dateOfJoining,
      department,
      position,
      workPassword,
      userId: user._id
    }).save();

    // Email credentials
    const emailHtml = `
      <h2>Welcome to CzarCore!</h2>
      <p>Dear ${name},</p>
      <p>Your account has been created successfully:</p>
      <p>Email: ${workEmail}</p>
      <p>Password: ${workPassword}</p>
      <p>Please change your password after login.</p>
    `;
    await sendEmail(personalEmail, 'Your CzarCore Credentials', emailHtml);

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { name, personalEmail, dateOfBirth, dateOfJoining, availableLeaves, department, position } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, personalEmail, dateOfBirth, dateOfJoining, availableLeaves, department, position, updatedAt: new Date() },
      { new: true }
    );

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await User.findByIdAndUpdate(employee.userId, { name });
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await User.findByIdAndDelete(employee.userId);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all leave requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('employeeId', 'name department employeeId')
      .sort({ appliedAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Approve/Reject leave request
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { status } = req.body;

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewedAt: new Date(), reviewedBy: req.user.userId },
      { new: true }
    ).populate('employeeId', 'name department employeeId');

    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });

    res.json({ message: `Leave request ${status} successfully`, leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
