const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://czarcore.netlify.app', /\.netlify\.app$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Email transporter setup


// User registration (admin or employee)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or employee' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role,
      updatedAt: new Date()
    });
    await user.save();
    
    // If registering as employee, also create Employee record
    if (role === 'employee') {
      const employee = new Employee({
        employeeId: `EMP${Date.now()}`, // Generate unique employee ID
        name,
        personalEmail: email,
        workEmail: email,
        dateOfBirth: new Date(), // Default date, can be updated later
        dateOfJoining: new Date(),
        availableLeaves: 20,
        department: 'General', // Default department
        position: 'Employee',
        workPassword: password,
        userId: user._id
      });
      await employee.save();
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'czarcore_secret_key', 
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    user.updatedAt = new Date();
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'czarcore_secret_key', 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'czarcore_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

// Middleware to check admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin routes
// Get all employees (admin only)
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().select('-workPassword');
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee (admin only)
app.post('/api/admin/employees', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, personalEmail, dateOfBirth, dateOfJoining, department, position, employeeId } = req.body;
    
    if (!name || !personalEmail || !dateOfBirth || !dateOfJoining || !department || !position || !employeeId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    // Generate work email
    const workEmail = `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`;
    
    // Generate work password from DOB (ddmmyyyy format)
    const dob = new Date(dateOfBirth);
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    const workPassword = `${day}${month}${year}`;
    
    // Create User account for login
    const hashedPassword = await bcrypt.hash(workPassword, 12);
    const user = new User({
      name,
      email: workEmail,
      password: hashedPassword,
      role: 'employee'
    });
    await user.save();
    
    // Create Employee record
    const employee = new Employee({
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
    });
    await employee.save();
    
    // Send credentials via email
    const emailHtml = `
      <h2>Welcome to CzarCore!</h2>
      <p>Dear ${name},</p>
      <p>Your employee account has been created successfully. Here are your login credentials:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Work Email:</strong> ${workEmail}</p>
        <p><strong>Password:</strong> ${workPassword}</p>
      </div>
      <p>Please login at: <a href="http://localhost:3000">http://localhost:3000</a></p>
      <p>For security, please change your password after first login.</p>
      <br>
      <p>Best regards,<br>CzarCore Team</p>
    `;
    
    const emailSent = await sendEmail(personalEmail, 'Your CzarCore Account Credentials', emailHtml);
    
    res.status(201).json({ 
      message: 'Employee created successfully',
      emailSent,
      employee: {
        ...employee.toObject(),
        workPassword: undefined
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee (admin only)
app.put('/api/admin/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, personalEmail, dateOfBirth, dateOfJoining, availableLeaves, department, position } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, personalEmail, dateOfBirth, dateOfJoining, availableLeaves, department, position, updatedAt: new Date() },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update corresponding user record
    await User.findByIdAndUpdate(employee.userId, { name });
    
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee (admin only)
app.delete('/api/admin/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Delete corresponding user record
    await User.findByIdAndDelete(employee.userId);
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Holiday management APIs
// Get holidays for a year
app.get('/api/holidays/:year', verifyToken, async (req, res) => {
  try {
    const holidays = await Holiday.find({ year: req.params.year }).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add holiday (admin only)
app.post('/api/admin/holidays', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, date, type } = req.body;
    const year = new Date(date).getFullYear();
    
    const holiday = new Holiday({ name, date, type, year });
    await holiday.save();
    
    res.status(201).json({ message: 'Holiday added successfully', holiday });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update holiday (admin only)
app.put('/api/admin/holidays/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, date, type } = req.body;
    const year = new Date(date).getFullYear();
    
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { name, date, type, year },
      { new: true }
    );
    
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    res.json({ message: 'Holiday updated successfully', holiday });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete holiday (admin only)
app.delete('/api/admin/holidays/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave request APIs
// Get all leave requests (admin only)
app.get('/api/admin/leave-requests', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('employeeId', 'name department employeeId')
      .sort({ appliedAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject leave request (admin only)
app.put('/api/admin/leave-requests/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        reviewedAt: new Date(),
        reviewedBy: req.user.userId 
      },
      { new: true }
    ).populate('employeeId', 'name department employeeId');
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    res.json({ message: `Leave request ${status} successfully`, leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee routes
// Get employee profile (by employee)
app.get('/api/employee/profile', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId }).select('-workPassword');
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Simplified API endpoints for AdminPanel
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().select('-workPassword');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employees', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, availableLeaves, dateOfJoining, employeeId, dateOfBirth, department, position, role, phone, address, profilePhoto, salary } = req.body;
    
    if (!name || !department || !position || !role || !dateOfJoining || !dateOfBirth) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Auto-generate employee ID, work email, and password from DOB
    const nameForId = name.toLowerCase().replace(/[^a-z]/g, '');
    const timestamp = Date.now().toString().slice(-4);
    const finalEmployeeId = employeeId || `EMP${nameForId.slice(0, 3).toUpperCase()}${timestamp}`;
    const finalEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@czarcore.com`;
    
    // Generate password from DOB (DDMMYYYY format)
    const dob = new Date(dateOfBirth);
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    const defaultPassword = password || `${day}${month}${year}`;
    
    const existingEmployee = await Employee.findOne({ employeeId: finalEmployeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    const user = new User({
      name,
      email: finalEmail,
      password: hashedPassword,
      role: 'employee'
    });
    await user.save();
    
    const employee = new Employee({
      employeeId: finalEmployeeId,
      name,
      personalEmail: finalEmail,
      workEmail: finalEmail,
      dateOfBirth,
      dateOfJoining,
      availableLeaves: availableLeaves || 20,
      department,
      position,
      role: role || 'Employee',
      profilePhoto: profilePhoto || '',
      workPassword: defaultPassword,
      userId: user._id,
      phone: phone || '',
      address: address || '',
      salary: salary !== undefined && salary !== '' ? Number(salary) : null
    });

    await employee.save();
    res.status(201).json({ message: 'Employee created successfully', employee: { ...employee.toObject(), workPassword: undefined } });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, availableLeaves, dateOfJoining, employeeId, dateOfBirth, department, position, role, phone, address, profilePhoto, salary } = req.body;
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updateData = {
      name,
      personalEmail: email,
      workEmail: email,
      availableLeaves,
      dateOfJoining,
      employeeId,
      dateOfBirth,
      department,
      position,
      role,
      phone: phone || '',
      address: address || '',
      profilePhoto: profilePhoto || '',
      salary: salary !== undefined && salary !== '' ? Number(salary) : employee.salary,
      updatedAt: new Date()
    };

    if (password) {
      updateData.workPassword = password;
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.findByIdAndUpdate(employee.userId, { 
        password: hashedPassword,
        email: email,
        name: name
      });
    } else {
      await User.findByIdAndUpdate(employee.userId, { 
        email: email,
        name: name
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-workPassword');

    res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/employees/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await User.findByIdAndDelete(employee.userId);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request received for holiday ID:', id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return res.status(400).json({ message: 'Invalid holiday ID format' });
    }
    
    const holiday = await Holiday.findByIdAndDelete(id);
    console.log('Holiday found and deleted:', holiday ? 'Yes' : 'No');
    
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/holidays', async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/holidays', async (req, res) => {
  try {
    const { name, date, year } = req.body;
    
    const holiday = new Holiday({
      name,
      date,
      year
    });

    await holiday.save();
    res.status(201).json({ message: 'Holiday created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/leave-requests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('employeeId', 'name employeeId')
      .sort({ appliedAt: -1 });
    
    const formattedRequests = leaveRequests.map(request => ({
      _id: request._id,
      employeeName: request.employeeId?.name || 'Unknown',
      employeeId: request.employeeId?.employeeId || 'Unknown',
      leaveType: request.leaveType,
      startDate: request.fromDate,
      endDate: request.toDate,
      days: request.days,
      reason: request.reason,
      status: request.status
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id, 
      { status, reviewedAt: new Date() }, 
      { new: true }
    );
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employee/leave-requests', verifyToken, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    
    const leaveRequest = new LeaveRequest({
      employeeId: employee._id,
      leaveType,
      fromDate,
      toDate,
      days,
      reason
    });

    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee's own leave requests
app.get('/api/employee/my-leave-requests', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ appliedAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change employee password
app.put('/api/employee/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create default admin account if none exists
const createDefaultAdmin = async () => {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@czarcore.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin account created:');
      console.log('Email: admin@czarcore.com');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Add sample holidays if none exist
const addSampleHolidays = async () => {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
    const holidayCount = await Holiday.countDocuments();
    if (holidayCount === 0) {
      const sampleHolidays = [
        { name: 'New Year\'s Day', date: new Date('2024-01-01'), year: 2024 },
        { name: 'Independence Day', date: new Date('2024-08-15'), year: 2024 },
        { name: 'Gandhi Jayanti', date: new Date('2024-10-02'), year: 2024 },
        { name: 'Christmas', date: new Date('2024-12-25'), year: 2024 },
        { name: 'Diwali', date: new Date('2024-11-01'), year: 2024 }
      ];
      await Holiday.insertMany(sampleHolidays);
      console.log('Sample holidays added');
    }
  } catch (error) {
    console.error('Error adding sample holidays:', error);
  }
};



// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`CzarCore server running on port ${PORT}`);
  
  // Initialize default data after connection is established
  mongoose.connection.once('connected', () => {
    console.log('MongoDB connection established, initializing default data...');
    createDefaultAdmin();
    addSampleHolidays();
  });
});