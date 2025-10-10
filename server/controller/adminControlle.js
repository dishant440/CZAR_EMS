const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const Employee = require("../model/employeeModel");
const LeaveRequest = require("../model/leaveRequest");
const { sendEmail } = require("../utils/emailService");

// Utility: Ensure only admins can access
async function ensureAdmin(req, res) {
  const admin = await Employee.findOne({ userId: req.user.userId });
  console.log(admin);
  
  if (!admin || admin.role !== "Admin") {
    res.status(403).json({ message: "Access denied — Admins only" });
    return false;
  }
  return true;
}

// ✅ Admin: Get all employees
exports.getUsers = async (req, res) => {
  try {
    // if (!(await ensureAdmin(req, res))) return;

    const employees = await Employee.find().select("-workPassword");
    res.status(200).json(employees);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Create employee (with optional admin role)
exports.createEmployee = async (req, res) => {
  try {
    // if (!(await ensureAdmin(req, res))) return;

    const {
      name,
      personalEmail,
      dateOfBirth,
      dateOfJoining,
      department,
      position,
      employeeId,
      role = "Employee", // 👈 optional role from admin panel
    } = req.body;

    if (
      !name ||
      !personalEmail ||
      !dateOfBirth ||
      !dateOfJoining ||
      !department ||
      !position ||
      !employeeId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing Employee ID or Email
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { personalEmail }],
    });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this ID or email already exists" });
    }

    // Generate work email & password
    const workEmail = `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`;
    const dob = new Date(dateOfBirth);
    const day = String(dob.getDate()).padStart(2, "0");
    const month = String(dob.getMonth() + 1).padStart(2, "0");
    const year = dob.getFullYear();
    const workPassword = `${day}${month}${year}`; // DOB-based initial password

    const hashedPassword = await bcrypt.hash(workPassword, 12);

    // Create User
    const user = await new User({
      name,
      email: workEmail,
      password: hashedPassword,
      role: role.toLowerCase(), // 'admin' or 'employee'
    }).save();

    // Create Employee record
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
      role, // 👈 sets 'Admin' or 'Employee'
      userId: user._id,
    }).save();

   
    res.status(201).json({
      message: `${role} created successfully`,
      employee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Update employee details
exports.updateEmployee = async (req, res) => {
  try {
    if (!(await ensureAdmin(req, res))) return;

    const {
      name,
      personalEmail,
      dateOfBirth,
      dateOfJoining,
      availableLeaves,
      department,
      position,
      role,
    } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name,
        personalEmail,
        dateOfBirth,
        dateOfJoining,
        availableLeaves,
        department,
        position,
        role,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Update User name and role for consistency
    await User.findByIdAndUpdate(employee.userId, {
      name,
      role: role?.toLowerCase(),
    });

    res.status(200).json({
      message: `${employee.role} updated successfully`,
      employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    if (!(await ensureAdmin(req, res))) return;

    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    await User.findByIdAndDelete(employee.userId);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Get all leave requests
exports.getLeaveRequests = async (req, res) => {
  try {
    if (!(await ensureAdmin(req, res))) return;

    const leaveRequests = await LeaveRequest.find()
      .populate("employeeId", "name department employeeId role")
      .sort({ appliedAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Get Leave Requests Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Approve or reject leave requests
exports.reviewLeaveRequest = async (req, res) => {
  try {
    if (!(await ensureAdmin(req, res))) return;

    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.userId,
      },
      { new: true }
    ).populate("employeeId", "name department employeeId");

    if (!leaveRequest)
      return res.status(404).json({ message: "Leave request not found" });

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest,
    });
  } catch (error) {
    console.error("Review Leave Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
