const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const Employee = require('../model/employeeModel');
const LeaveRequest = require('../model/leaveRequest');

// ✅ Get employee profile (self or admin access)
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const employee = await Employee.findOne({ userId }).select('-workPassword');
//     if (!employee) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }

//     res.status(200).json(employee);
//   } catch (error) {
//     console.error('Get Profile Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// ✅ Get employee profile along with leave requests
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(userId);
    

    // Find employee
    const employee = await Employee.findOne({ userId }).select('-workPassword');
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    console.log(employee);
    
    // Fetch all leave requests by this employee
    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ appliedAt: -1 })
      .select('-__v'); // clean response

    // Combine both data sets into one response payload
    const responsePayload = {
      ...employee.toObject(),
      leaveRequests, // ✅ attach leave request list
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Change password (for current user)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password too short (min 6 chars)' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Submit a leave request (Employee only)
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = new LeaveRequest({
      employeeId: employee._id,
      leaveType,
      fromDate,
      toDate,
      days,
      reason,
      status: 'Pending',
    });

    await leaveRequest.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest,
    });
  } catch (error) {
    console.error('Submit Leave Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get all own leave requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ createdAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Get Leave Requests Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ADMIN FEATURE — Get all employees (Admin only)
exports.getAllEmployees = async (req, res) => {
  try {
    const requester = await Employee.findOne({ userId: req.user.userId });

    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied — Admins only' });
    }

    const employees = await Employee.find().select('-workPassword');
    res.status(200).json(employees);
  } catch (error) {
    console.error('Get All Employees Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ADMIN FEATURE — Approve or reject leave requests
exports.updateLeaveStatus = async (req, res) => {
  try {
    const requester = await Employee.findOne({ userId: req.user.userId });
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied — Admins only' });
    }

    const { requestId, status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leaveRequest = await LeaveRequest.findById(requestId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully`, leaveRequest });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ADMIN FEATURE — Promote an employee to admin
exports.makeAdmin = async (req, res) => {
  try {
    const requester = await Employee.findOne({ userId: req.user.userId });
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied — Admins only' });
    }

    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.role = 'Admin';
    await employee.save();

    res.status(200).json({ message: 'Employee promoted to Admin successfully', employee });
  } catch (error) {
    console.error('Make Admin Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
