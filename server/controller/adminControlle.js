const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const Employee = require("../model/employeeModel");
const LeaveRequest = require("../model/leaveRequest");
const { sendEmail } = require("../utils/emailService");
const Admin = require('../model/adminModel')

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
    console.log("hii");
    

    const employees = await Employee.find().select("-workPassword");
    console.log(employees);
    
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


exports.getAdminDetails = async (req, res) => {
  try {
    const adminId = req.query.id;

    console.log("demo : ",adminId);
    

    // if (!adminId) {
    //   return res.status(400).json({ message: "Admin ID is required" });
    // }

    const admin = await Admin.findById(adminId).select("-password");
    console.log("admin : ",admin);
    

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin details fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ message: "Server error fetching admin details" });
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
    // if (!(await ensureAdmin(req, res))) return;

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
    // if (!(await ensureAdmin(req, res))) return;

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


// ✅ GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    // 1️⃣ Total Employees
    const totalEmployees = await Employee.countDocuments();

    // 2️⃣ Today's Date (without time)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // 3️⃣ On Leave Today
    const onLeaveToday = await LeaveRequest.countDocuments({
      status: "Approved",
      fromDate: { $lte: todayStr },
      toDate: { $gte: todayStr },
    });

    // 4️⃣ Attendance Summary (Present / Absent)
    const todayAttendance = 9
    const presentCount =8
    const absentCount = 1

    // 5️⃣ Pending Leave Requests
    const pendingRequests = await LeaveRequest.find({ status: "Pending" })
      .limit(5)
      .populate("employeeId", "name");

    const leaveRequests = pendingRequests.map((r) => ({
      employeeName: r.employeeId?.name || "Unknown",
      leaveType: r.leaveType,
      fromDate: r.fromDate,
      toDate: r.toDate,
      status: r.status,
    }));

    // 6️⃣ Upcoming Birthdays (next 7 days)
    const employees = await Employee.find({}, "name dateOfBirth");
    const now = new Date();
    const upcomingBirthdays = employees
      .filter((emp) => {
        if (!emp.dateOfBirth) return false;
        const dob = new Date(emp.dateOfBirth);
        const upcomingBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
        const diffDays = Math.ceil((upcomingBirthday - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      })
      .map((emp) => ({
        name: emp.name,
        date: new Date(emp.dateOfBirth).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));

    // ✅ Response
    res.status(200).json({
      totalEmployees,
      onLeaveToday,
      attendanceSummary: { present: presentCount, absent: absentCount },
      leaveRequests,
      upcomingBirthdays,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Server error fetching admin dashboard" });
  }
};
