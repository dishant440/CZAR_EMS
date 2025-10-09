import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

function AdminPanel() {
  const [theme, setTheme] = useState('light');
  
  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes checkmark {
        0% { transform: scale(0) rotate(45deg); }
        50% { transform: scale(1.2) rotate(45deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      .animate-slideUp { animation: slideUp 0.4s ease-out; }
      .animate-checkmark { animation: checkmark 0.6s ease-out; }
      .animate-bounce { animation: bounce 1s ease-in-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    availableLeaves: '',
    dateOfJoining: '',
    employeeId: '',
    dateOfBirth: '',
    department: '',
    position: '',
    role: '',
    phone: '',
    address: '',
    profilePhoto: '',
    salary: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    year: new Date().getFullYear()
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [payrollFilter, setPayrollFilter] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bonusAmount, setBonusAmount] = useState('');
  const [selectedPayrollEmployee, setSelectedPayrollEmployee] = useState(null);
  const [employeeBonus, setEmployeeBonus] = useState('');
  const [employeeAllowance, setEmployeeAllowance] = useState('');
  const [employeeDeduction, setEmployeeDeduction] = useState('');
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@czarcore.com',
    phone: '+1 234 567 8900',
    department: 'Administration',
    bio: 'System Administrator managing CzarCore Employee Management System.',
    photo: null
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success', // 'success', 'error', 'warning', 'info'
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });
  const { toasts, showToast, removeToast } = useToast();

  // Generate professional payslip with CzarCore letterhead
  const generatePayslip = (employee, bonus = 0) => {
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const basicSalary = employee.salary || 0;
    const bonusAmount = parseInt(bonus) || 0;
    const grossSalary = basicSalary + bonusAmount;
    const pf = Math.round(basicSalary * 0.12); // 12% PF
    const tax = Math.round(grossSalary * 0.1); // 10% tax
    const netSalary = grossSalary - pf - tax;

    return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                  CZARCORE                                   ║
║                          Employee Management System                          ║
║                     📧 contact@czarcore.com | 📞 +91-XXXXXXXXXX              ║
║                          🌐 www.czarcore.com                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                 PAYSLIP                                     ║
║                              ${month}                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  EMPLOYEE DETAILS:                                                           ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Name         : ${employee.name?.padEnd(50) || 'N/A'.padEnd(50)}           ║
║  Employee ID  : ${employee.employeeId?.padEnd(50) || 'N/A'.padEnd(50)}     ║
║  Department   : ${employee.department?.padEnd(50) || 'N/A'.padEnd(50)}     ║
║  Position     : ${employee.position?.padEnd(50) || 'N/A'.padEnd(50)}       ║
║  Date of Join : ${(employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A').padEnd(50)} ║
║                                                                              ║
║  SALARY BREAKDOWN:                                                           ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Basic Salary                                           ₹${basicSalary.toLocaleString().padStart(15)} ║
║  Bonus/Incentive                                        ₹${bonusAmount.toLocaleString().padStart(15)} ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Gross Salary                                           ₹${grossSalary.toLocaleString().padStart(15)} ║
║                                                                              ║
║  DEDUCTIONS:                                                                 ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Provident Fund (12%)                                   ₹${pf.toLocaleString().padStart(15)} ║
║  Tax Deduction (10%)                                    ₹${tax.toLocaleString().padStart(15)} ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Total Deductions                                       ₹${(pf + tax).toLocaleString().padStart(15)} ║
║                                                                              ║
║  NET SALARY                                             ₹${netSalary.toLocaleString().padStart(15)} ║
║                                                                              ║
║  ──────────────────────────────────────────────────────────────────────────   ║
║  Generated on: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}                    ║
║                                                                              ║
║  This is a computer-generated payslip and does not require a signature.     ║
║                                                                              ║
║                           Thank you for your service!                       ║
║                                  CZARCORE                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load current admin user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      // Try to load user-specific profile first
      const savedProfile = localStorage.getItem(`adminProfile_${currentUser.id}`);
      if (savedProfile) {
        try {
          setAdminProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error('Error loading admin profile:', error);
        }
      } else {
        // Set default profile for new admin
        setAdminProfile({
          name: currentUser.name || 'Admin User',
          email: currentUser.email || 'admin@czarcore.com',
          phone: '+1 234 567 8900',
          department: 'Administration',
          bio: 'System Administrator managing CzarCore Employee Management System.',
          photo: null
        });
      }
    }
    
    fetchEmployees();
    fetchHolidays();
    fetchLeaveRequests();
    
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save admin profile to localStorage with user-specific key
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      localStorage.setItem(`adminProfile_${currentUser.id}`, JSON.stringify(adminProfile));
    }
  }, [adminProfile]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: newTheme }));
  };

  const showPopup = (type, title, message, onConfirm = null, showCancel = false) => {
    if (showCancel || onConfirm) {
      setModalConfig({ type, title, message, onConfirm, showCancel });
      setShowModal(true);
    } else {
      showToast(message, type);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalConfig({ type: 'success', title: '', message: '', onConfirm: null, showCancel: false });
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      showPopup('error', 'Error', 'Failed to fetch employees data.');
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/holidays');
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      showPopup('error', 'Error', 'Failed to fetch holidays data.');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave-requests');
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      showPopup('error', 'Error', 'Failed to fetch leave requests data.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Input sanitization and formatting
    try {
      if (name === 'name') {
        // Allow spaces but clean up extra spaces and trim
        processedValue = value.replace(/\s+/g, ' ').trim();
      } else if (name === 'phone') {
        // Allow only numbers, spaces, hyphens, plus, and parentheses
        processedValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
      } else if (name === 'availableLeaves') {
        // Ensure only valid numbers
        if (value !== '' && (isNaN(value) || value < 0 || value > 30)) {
          return; // Don't update if invalid
        }
      }
      
      const updatedData = {
        ...formData,
        [name]: processedValue
      };
      
      // Auto-generate employee ID and work email when name changes
      if (name === 'name' && processedValue.trim()) {
        const nameForId = processedValue.toLowerCase().replace(/[^a-z]/g, '');
        if (nameForId.length >= 3) {
          const timestamp = Date.now().toString().slice(-4);
          updatedData.employeeId = `EMP${nameForId.slice(0, 3).toUpperCase()}${timestamp}`;
          
          // Generate professional email with mixed letters and numbers
          const nameParts = processedValue.trim().toLowerCase().split(/\s+/);
          let baseEmail = '';
          
          if (nameParts.length >= 2) {
            // First initial + last name + random numbers (e.g., s.patel247)
            const firstInitial = nameParts[0].charAt(0);
            const lastName = nameParts[nameParts.length - 1];
            const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit number
            baseEmail = `${firstInitial}.${lastName}${randomNum}`;
          } else {
            // Name + mixed letters and numbers (e.g., siddhi.x7k2)
            const name = nameParts[0];
            const randomLetters = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + 
                                String.fromCharCode(97 + Math.floor(Math.random() * 26));
            const randomNums = Math.floor(Math.random() * 90) + 10;
            baseEmail = `${name}.${randomLetters}${randomNums}`;
          }
          
          // Check for existing emails and regenerate if needed
          let emailToCheck = `${baseEmail}@czarcore.com`;
          let attempts = 0;
          
          while (employees.some(emp => 
            (emp.email === emailToCheck || emp.workEmail === emailToCheck) && 
            (!editingEmployee || emp._id !== editingEmployee._id)
          ) && attempts < 5) {
            // Regenerate with new random elements
            if (nameParts.length >= 2) {
              const firstInitial = nameParts[0].charAt(0);
              const lastName = nameParts[nameParts.length - 1];
              const randomNum = Math.floor(Math.random() * 900) + 100;
              baseEmail = `${firstInitial}.${lastName}${randomNum}`;
            } else {
              const name = nameParts[0];
              const randomLetters = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + 
                                  String.fromCharCode(97 + Math.floor(Math.random() * 26));
              const randomNums = Math.floor(Math.random() * 90) + 10;
              baseEmail = `${name}.${randomLetters}${randomNums}`;
            }
            emailToCheck = `${baseEmail}@czarcore.com`;
            attempts++;
          }
          
          updatedData.email = emailToCheck;
        }
      }
      
      // Auto-generate password from DOB when date of birth changes
      if (name === 'dateOfBirth' && processedValue) {
        try {
          const dob = new Date(processedValue);
          if (!isNaN(dob.getTime())) {
            const day = String(dob.getDate()).padStart(2, '0');
            const month = String(dob.getMonth() + 1).padStart(2, '0');
            const year = dob.getFullYear();
            updatedData.password = `${day}${month}${year}`;
          }
        } catch (error) {
          console.warn('Invalid date format for password generation');
        }
      }
      
      setFormData(updatedData);
      
      // Clear specific field error when user starts typing
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }
    } catch (error) {
      console.error('Error processing input:', error);
      // Fallback to original value if processing fails
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    } else {
      // Check for duplicate email
      const duplicateEmail = employees.find(emp => 
        (emp.email === formData.email || emp.workEmail === formData.email) && 
        (!editingEmployee || emp._id !== editingEmployee._id)
      );
      if (duplicateEmail) {
        errors.email = 'Email already exists';
      }
    }
    
    // Department validation
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    // Position validation
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    } else if (formData.position.trim().length < 2) {
      errors.position = 'Position must be at least 2 characters';
    }
    
    // Role validation
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    
    // Date validations
    if (!formData.dateOfJoining) {
      errors.dateOfJoining = 'Date of joining is required';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (age < 18) {
        errors.dateOfBirth = 'Employee must be at least 18 years old';
      } else if (age > 65) {
        errors.dateOfBirth = 'Employee age cannot exceed 65 years';
      }
    }
    
    // Available leaves validation
    if (formData.availableLeaves === '' || formData.availableLeaves === null) {
      errors.availableLeaves = 'Available leaves is required';
    } else if (isNaN(formData.availableLeaves) || formData.availableLeaves < 0 || formData.availableLeaves > 30) {
      errors.availableLeaves = 'Available leaves must be between 0 and 30';
    }
    
    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        errors.phone = 'Invalid phone number format';
      } else if (formData.phone.replace(/[^\d]/g, '').length < 10) {
        errors.phone = 'Phone number must be at least 10 digits';
      }
    }
    
    // Duplicate Employee ID validation
    if (formData.employeeId) {
      const duplicateEmployee = employees.find(emp => 
        emp.employeeId === formData.employeeId && 
        (!editingEmployee || emp._id !== editingEmployee._id)
      );
      if (duplicateEmployee) {
        errors.employeeId = 'Employee ID already exists';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleHolidayChange = (e) => {
    setHolidayForm({
      ...holidayForm,
      [e.target.name]: e.target.value
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const getHolidayForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidaysArray.find(holiday => {
      const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
      return holidayDate === dateStr;
    });
    
    // Check if it's Sunday
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date.getDay() === 0) {
      return holiday || { name: 'Sunday', type: 'weekly' };
    }
    
    return holiday;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const openHolidayModal = (day = null) => {
    if (day) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      setHolidayForm({
        ...holidayForm,
        date: dateStr
      });
      
      // Check if there's already a holiday on this date
      const existingHoliday = getHolidayForDate(day);
      if (existingHoliday) {
        setEditingHoliday(existingHoliday);
        setHolidayForm({
          name: existingHoliday.name,
          date: existingHoliday.date.split('T')[0],
          year: currentDate.getFullYear()
        });
      } else {
        setEditingHoliday(null);
        setHolidayForm({
          name: '',
          date: dateStr,
          year: currentDate.getFullYear()
        });
      }
    } else {
      setSelectedDate(null);
      setEditingHoliday(null);
      setHolidayForm({
        name: '',
        date: '',
        year: currentDate.getFullYear()
      });
    }
    setShowHolidayModal(true);
  };

  const closeHolidayModal = () => {
    setShowHolidayModal(false);
    setSelectedDate(null);
    setEditingHoliday(null);
    setHolidayForm({
      name: '',
      date: '',
      year: currentDate.getFullYear()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error field
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const url = editingEmployee 
        ? `http://localhost:5000/api/employees/${editingEmployee._id}`
        : 'http://localhost:5000/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';
      
      // Sanitize form data before sending
      const sanitizedData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        role: formData.role.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || ''
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sanitizedData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchEmployees();
        resetForm();
        showToast(`Employee ${editingEmployee ? 'updated' : 'added'} successfully!`, 'success');
      } else {
        // Handle specific server errors
        if (response.status === 400) {
          showPopup('error', 'Invalid Data', data.message || 'Invalid data provided. Please check your inputs.');
        } else if (response.status === 401) {
          showPopup('error', 'Authentication Failed', 'Please login again.', () => {
            localStorage.removeItem('token');
            window.location.href = '/auth';
          });
        } else if (response.status === 409) {
          showPopup('error', 'Duplicate Entry', 'Employee with this email or ID already exists.');
        } else {
          showPopup('error', 'Error', data.message || 'Error saving employee. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.message.includes('fetch')) {
        showPopup('error', 'Network Error', 'Please check your connection and try again.');
      } else {
        showPopup('error', 'Unexpected Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const url = editingHoliday 
        ? `http://localhost:5000/api/holidays/${editingHoliday._id}`
        : 'http://localhost:5000/api/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayForm),
      });
      
      if (response.ok) {
        fetchHolidays();
        closeHolidayModal();
        showPopup('success', 'Success!', `Holiday ${editingHoliday ? 'updated' : 'added'} successfully!`);
      } else {
        const data = await response.json();
        showPopup('error', 'Error', data.message || 'Error saving holiday');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to save holiday. Please try again.');
    }
  };

  const checkOverlappingLeaves = (employeeId, startDate, endDate, excludeRequestId = null) => {
    return leaveRequests.filter(req => 
      req.employeeId === employeeId &&
      req.status === 'approved' &&
      req._id !== excludeRequestId &&
      ((new Date(startDate) >= new Date(req.startDate) && new Date(startDate) <= new Date(req.endDate)) ||
       (new Date(endDate) >= new Date(req.startDate) && new Date(endDate) <= new Date(req.endDate)) ||
       (new Date(startDate) <= new Date(req.startDate) && new Date(endDate) >= new Date(req.endDate)))
    );
  };

  const handleLeaveAction = async (request, action) => {
    // Enhanced confirmation with request details
    const employee = employees.find(emp => emp._id === request.employeeId);
    const employeeName = employee?.name || request.employeeName;
    const startDate = new Date(request.startDate).toLocaleDateString();
    const endDate = new Date(request.endDate).toLocaleDateString();
    
    let confirmMessage = `${action.toUpperCase()} LEAVE REQUEST\n\n`;
    confirmMessage += `Employee: ${employeeName}\n`;
    confirmMessage += `Leave Type: ${request.leaveType}\n`;
    confirmMessage += `Duration: ${startDate} to ${endDate} (${request.days} days)\n`;
    confirmMessage += `Reason: ${request.reason}\n\n`;
    
    if (action === 'approved') {
      // Check for overlapping leaves
      const overlapping = checkOverlappingLeaves(request.employeeId, request.startDate, request.endDate, request._id);
      if (overlapping.length > 0) {
        confirmMessage += `⚠️ WARNING: This employee has overlapping approved leaves:\n`;
        overlapping.forEach(overlap => {
          confirmMessage += `• ${new Date(overlap.startDate).toLocaleDateString()} to ${new Date(overlap.endDate).toLocaleDateString()}\n`;
        });
        confirmMessage += `\n`;
      }
      
      // Check available leaves
      if (employee && employee.availableLeaves < request.days) {
        confirmMessage += `⚠️ WARNING: Employee has only ${employee.availableLeaves} leaves remaining but requesting ${request.days} days\n\n`;
      }
    }
    
    confirmMessage += `Are you sure you want to ${action} this request?`;
    
    showPopup('warning', `${action.toUpperCase()} Leave Request`, confirmMessage, async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/leave-requests/${request._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: action }),
        });
        
        if (response.ok) {
          fetchLeaveRequests();
          showPopup('success', 'Success!', `Leave request ${action} successfully!`);
        }
      } catch (error) {
        showPopup('error', 'Network Error', 'Failed to update leave request. Please try again.');
      }
    }, true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      availableLeaves: '',
      dateOfJoining: '',
      employeeId: '',
      dateOfBirth: '',
      department: '',
      position: '',
      role: '',
      phone: '',
      address: '',
      profilePhoto: '',
      salary: ''
    });
    setFormErrors({});
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || employee.workEmail || employee.personalEmail || '',
      password: '',
      availableLeaves: employee.availableLeaves || 20,
      dateOfJoining: employee.dateOfJoining?.split('T')[0] || '',
      employeeId: employee.employeeId || '',
      dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
      department: employee.department || '',
      position: employee.position || '',
      role: employee.role || '',
      phone: employee.phone || '',
      address: employee.address || '',
      profilePhoto: employee.profilePhoto || '',
      salary: employee.salary || ''
    });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    showPopup('warning', 'Delete Employee', 'Are you sure you want to delete this employee? This action cannot be undone.', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          fetchEmployees();
          showPopup('success', 'Success!', 'Employee deleted successfully!');
        } else {
          const data = await response.json();
          showPopup('error', 'Error', data.message || 'Error deleting employee');
        }
      } catch (error) {
        showPopup('error', 'Network Error', 'Failed to delete employee. Please try again.');
      }
    }, true);
  };

  const handleHolidayDelete = async (holiday) => {
    showPopup('warning', 'Delete Holiday', `Are you sure you want to delete "${holiday.name}"? This action cannot be undone.`, async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/holidays/${holiday._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchHolidays();
          closeHolidayModal();
          showPopup('success', 'Success!', 'Holiday deleted successfully!');
        } else {
          const data = await response.json();
          showPopup('error', 'Error', data.message || 'Failed to delete holiday');
        }
      } catch (error) {
        showPopup('error', 'Network Error', 'Failed to delete holiday. Please try again.');
      }
    }, true);
  };

  const employeesArray = Array.isArray(employees) ? employees : [];
  const holidaysArray = Array.isArray(holidays) ? holidays : [];
  const leaveRequestsArray = Array.isArray(leaveRequests) ? leaveRequests : [];

  const filteredEmployees = employeesArray.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !departmentFilter || 
      emp.department?.toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesRole = !roleFilter || emp.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name?.localeCompare(b.name) || 0;
    if (sortBy === 'department') return a.department?.localeCompare(b.department) || 0;
    if (sortBy === 'employeeId') return a.employeeId?.localeCompare(b.employeeId) || 0;
    if (sortBy === 'dateOfJoining') return new Date(a.dateOfJoining) - new Date(b.dateOfJoining);
    return 0;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

  const departments = [...new Set(employeesArray.map(emp => emp.department).filter(Boolean))];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        <div className={`w-64 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg h-screen fixed transition-all duration-300 ease-in-out z-10`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-blue-600">CzarCore</h2>
            </div>
            <nav className="space-y-2">
              {[
                { id: 'dashboard', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>, label: 'Dashboard' },
                { id: 'employees', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/></svg>, label: 'Add Employee' },
                { id: 'allEmployees', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>, label: 'All Employees' },
                { id: 'leaveRequests', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, label: 'Leave Requests' },
                { id: 'holidays', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, label: 'Holiday Calendar' },
                { id: 'analytics', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>, label: 'Analytics' },
                { id: 'payroll', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h10zM4 11a1 1 0 100 2h1a1 1 0 100-2H4zM15 11a1 1 0 100 2h1a1 1 0 100-2h-1z"/></svg>, label: 'Payroll' },
                { id: 'settings', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>, label: 'Settings' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white transform scale-105'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-blue-700 text-white hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                showPopup('warning', 'Confirm Logout', 'Are you sure you want to logout?', () => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  window.location.href = '/auth';
                }, true);
              }}
              className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-red-700 text-white hover:bg-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="ml-64 flex-1 p-8 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'dashboard' && 'Admin Dashboard'}
                {activeTab === 'employees' && 'Add Employee'}
                {activeTab === 'holidays' && 'Holiday Calendar'}
                {activeTab === 'allEmployees' && 'All Employees'}
                {activeTab === 'leaveRequests' && 'Leave Requests'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'payroll' && 'Payroll Management'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-500">Admin Dashboard</p>
            </div>
            
            {/* Admin Profile Header */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {adminProfile.photo ? (
                    <img 
                      src={adminProfile.photo} 
                      alt="Admin" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    adminProfile.name?.charAt(0) || 'A'
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="font-medium">{adminProfile.name}</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className={`absolute right-0 mt-2 w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl border z-50`}>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {adminProfile.photo ? (
                          <img 
                            src={adminProfile.photo} 
                            alt="Admin" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          adminProfile.name?.charAt(0) || 'A'
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{adminProfile.name}</h3>
                        <p className="text-sm text-gray-500">{adminProfile.email}</p>
                        <p className="text-xs text-blue-600">{adminProfile.department}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <span>{adminProfile.phone}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{adminProfile.bio}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          showPopup('warning', 'Confirm Logout', 'Are you sure you want to logout?', () => {
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            window.location.href = '/auth';
                          }, true);
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-left transition-colors text-red-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { title: 'Total Employees', value: employeesArray.length.toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>, color: 'bg-blue-500' },
                  { title: 'Pending Requests', value: leaveRequestsArray.filter(req => req.status === 'pending').length.toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, color: 'bg-yellow-500' },
                  { title: 'On Leave Today', value: leaveRequestsArray.filter(req => {
                    if (req.status !== 'approved') return false;
                    const today = new Date();
                    const startDate = new Date(req.startDate);
                    const endDate = new Date(req.endDate);
                    return today >= startDate && today <= endDate;
                  }).length.toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>, color: 'bg-green-500' },
                  { title: 'Departments', value: [...new Set(employeesArray.map(emp => emp.department).filter(Boolean))].length.toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>, color: 'bg-purple-500' }
                ].map((stat, index) => (
                  <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-full text-white`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Welcome to Admin Dashboard
                    </h2>
                    <p className={`text-xl mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Manage employees, holidays, and leave requests efficiently
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button onClick={() => setActiveTab('employees')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105">
                        Add Employee
                      </button>
                      <button onClick={() => setActiveTab('leaveRequests')} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors transform hover:scale-105">
                        Review Requests
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                  <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                    On Leave Today
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {leaveRequestsArray.filter(req => {
                      if (req.status !== 'approved') return false;
                      const today = new Date();
                      const startDate = new Date(req.startDate);
                      const endDate = new Date(req.endDate);
                      return today >= startDate && today <= endDate;
                    }).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No employees on leave today</p>
                    ) : (
                      leaveRequestsArray.filter(req => {
                        if (req.status !== 'approved') return false;
                        const today = new Date();
                        const startDate = new Date(req.startDate);
                        const endDate = new Date(req.endDate);
                        return today >= startDate && today <= endDate;
                      }).map((request, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 border-green-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{request.employeeName}</p>
                              <p className="text-sm text-gray-500">{request.leaveType} leave</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{request.days} days</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-600">Holiday Calendar</h2>
                    <p className="text-gray-500">Click on any date to add or edit holidays</p>
                  </div>
                  <button
                    onClick={() => openHolidayModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Holiday
                  </button>
                </div>

                {/* Calendar Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h3 className="text-xl font-semibold">{getMonthName(currentDate)}</h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`p-3 text-center font-semibold text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                    <div key={`empty-${i}`} className="p-3"></div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                    const day = i + 1;
                    const holiday = getHolidayForDate(day);
                    const today = isToday(day);

                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isSunday = date.getDay() === 0;
                    
                    return (
                      <div
                        key={day}
                        onClick={() => !isSunday && openHolidayModal(day)}
                        className={`p-3 text-center rounded-lg transition-all duration-200 relative ${
                          isSunday ? 'cursor-default' : 'cursor-pointer'
                        } ${
                          today
                            ? 'bg-blue-600 text-white font-bold'
                            : holiday || isSunday
                            ? theme === 'dark'
                              ? isSunday ? 'bg-purple-700 text-white' : 'bg-red-700 text-white hover:bg-red-600'
                              : isSunday ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800 hover:bg-red-200'
                            : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {holiday && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <div className={`text-xs truncate px-1 ${
                              today ? 'text-blue-100' : 'text-red-600'
                            }`}>
                              {holiday.name}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${
                      theme === 'dark' ? 'bg-red-700' : 'bg-red-100'
                    }`}></div>
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${
                      theme === 'dark' ? 'bg-purple-700' : 'bg-purple-100'
                    }`}></div>
                    <span>Sunday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 border-dashed ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    }`}></div>
                    <span>Click to add holiday</span>
                  </div>
                </div>
              </div>

              {/* Holiday List */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Holidays in {getMonthName(currentDate)}</h3>
                <div className="space-y-2">
                  {holidaysArray
                    .filter(holiday => {
                      const holidayDate = new Date(holiday.date);
                      return holidayDate.getMonth() === currentDate.getMonth() && 
                             holidayDate.getFullYear() === currentDate.getFullYear();
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(holiday => (
                      <div key={holiday._id} className={`flex justify-between items-center p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div>
                          <h4 className="font-medium">{holiday.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingHoliday(holiday);
                              setHolidayForm({
                                name: holiday.name,
                                date: holiday.date.split('T')[0],
                                year: new Date(holiday.date).getFullYear()
                              });
                              setShowHolidayModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleHolidayDelete(holiday)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  {holidaysArray.filter(holiday => {
                    const holidayDate = new Date(holiday.date);
                    return holidayDate.getMonth() === currentDate.getMonth() && 
                           holidayDate.getFullYear() === currentDate.getFullYear();
                  }).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No holidays in this month</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {showAddForm ? 'Cancel' : 'Add Employee'}
                </button>
              </div>

              {showAddForm && (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md mb-6`}>
                  <h3 className="text-lg font-semibold mb-6 text-indigo-600">
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          maxLength="50"
                          className={`w-full p-3 border rounded-lg ${formErrors.name ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Work Email * (Auto-generated)</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Auto-generated from name"
                          value={formData.email}
                          readOnly
                          className={`w-full p-3 border rounded-lg bg-gray-100 ${formErrors.email ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        />
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${formErrors.dateOfBirth ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Employee ID * (Auto-generated)</label>
                        <input
                          type="text"
                          name="employeeId"
                          placeholder="Auto-generated from name"
                          value={formData.employeeId}
                          readOnly
                          className={`w-full p-3 border rounded-lg bg-gray-100 ${formErrors.employeeId ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        />
                        {formErrors.employeeId && <p className="text-red-500 text-sm mt-1">{formErrors.employeeId}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Department *</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${formErrors.department ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Department</option>
                          <option value="IT">IT</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="Sales">Sales</option>
                          <option value="General">General</option>
                        </select>
                        {formErrors.department && <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Position *</label>
                        <input
                          type="text"
                          name="position"
                          placeholder="Enter position/job title"
                          value={formData.position}
                          onChange={handleInputChange}
                          maxLength="50"
                          className={`w-full p-3 border rounded-lg ${formErrors.position ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.position && <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Role *</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${formErrors.role ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Role</option>
                          <option value="Manager">Manager</option>
                          <option value="Team Lead">Team Lead</option>
                          <option value="Senior Developer">Senior Developer</option>
                          <option value="Developer">Developer</option>
                          <option value="Junior Developer">Junior Developer</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Designer">Designer</option>
                          <option value="Tester">Tester</option>
                          <option value="HR">HR</option>
                          <option value="Admin">Admin</option>
                        </select>
                        {formErrors.role && <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Password * (Auto-generated from DOB)</label>
                        <input
                          type="text"
                          name="password"
                          placeholder="Auto-generated from date of birth"
                          value={formData.password}
                          readOnly
                          className={`w-full p-3 border rounded-lg bg-gray-100 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Profile Photo</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setFormData({...formData, profilePhoto: event.target.result});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className={`flex-1 p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                          </div>
                          <div className="text-center text-sm text-gray-500">OR</div>
                          <input
                            type="url"
                            name="profilePhoto"
                            placeholder="Enter image URL for better quality"
                            value={formData.profilePhoto.startsWith('data:') ? '' : formData.profilePhoto}
                            onChange={handleInputChange}
                            className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                          />
                          {formData.profilePhoto && (
                            <div className="mt-2">
                              <img 
                                src={formData.profilePhoto} 
                                alt="Preview" 
                                className="w-16 h-16 rounded-full object-cover"
                                style={{
                                  imageRendering: 'crisp-edges',
                                  imageRendering: '-webkit-optimize-contrast',
                                  imageRendering: 'optimize-contrast'
                                }}
                              />
                              {formData.profilePhoto.startsWith('data:') && (
                                <p className="text-xs text-gray-500 mt-1">Size: {Math.round(formData.profilePhoto.length * 0.75 / 1024)}KB</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Joining *</label>
                        <input
                          type="date"
                          name="dateOfJoining"
                          value={formData.dateOfJoining}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${formErrors.dateOfJoining ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfJoining}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Available Leaves *</label>
                        <input
                          type="number"
                          name="availableLeaves"
                          placeholder="20"
                          min="0"
                          max="30"
                          step="1"
                          value={formData.availableLeaves}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${formErrors.availableLeaves ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.availableLeaves && <p className="text-red-500 text-sm mt-1">{formErrors.availableLeaves}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Monthly Salary (₹)</label>
                        <input
                          type="number"
                          name="salary"
                          placeholder="Enter salary"
                          min="0"
                          step="1000"
                          value={formData.salary || ''}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength="15"
                          className={`w-full p-3 border rounded-lg ${formErrors.phone ? 'border-red-500' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                          name="address"
                          placeholder="Enter address (optional)"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          maxLength="200"
                          className={`w-full p-3 border rounded-lg resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
                <table className="w-full">
                  <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Available Leaves</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {employeesArray.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.workEmail || employee.personalEmail || employee.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.position || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{employee.availableLeaves}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'allEmployees' && (
            <div>
              <div className="mb-6 space-y-4">
                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search by name, department, or employee ID"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <select
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">All Roles</option>
                    {[...new Set(employeesArray.map(emp => emp.role).filter(Boolean))].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="department">Sort by Department</option>
                    <option value="employeeId">Sort by ID</option>
                    <option value="dateOfJoining">Sort by Join Date</option>
                  </select>
                </div>
                
                {/* Filter Summary */}
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="ml-1 hover:bg-blue-200 rounded-full p-1">
                        ×
                      </button>
                    </span>
                  )}
                  {departmentFilter && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                      Dept: {departmentFilter}
                      <button onClick={() => setDepartmentFilter('')} className="ml-1 hover:bg-green-200 rounded-full p-1">
                        ×
                      </button>
                    </span>
                  )}
                  {roleFilter && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                      Role: {roleFilter}
                      <button onClick={() => setRoleFilter('')} className="ml-1 hover:bg-purple-200 rounded-full p-1">
                        ×
                      </button>
                    </span>
                  )}
                  {(searchQuery || departmentFilter || roleFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDepartmentFilter('');
                        setRoleFilter('');
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <p className={`text-sm text-center sm:text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing {startIndex + 1}-{Math.min(startIndex + employeesPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      Prev
                    </button>
                    <span className={`px-3 py-1 rounded text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {currentEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEmployeeDetails(true);
                    }}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-100 relative">
                        {employee.profilePhoto && employee.profilePhoto.trim() !== '' ? (
                          <img
                            src={employee.profilePhoto}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                            style={{
                              imageRendering: 'crisp-edges',
                              imageRendering: '-webkit-optimize-contrast',
                              imageRendering: 'optimize-contrast',
                              msInterpolationMode: 'nearest-neighbor'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                            {employee.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">{employee.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>ID: {employee.employeeId}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{employee.department}</p>
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Click to view details
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No employees found matching your criteria</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaveRequests' && (
            <div>
              {/* Mobile-friendly leave requests */}
              <div className="block lg:hidden space-y-4">
              {leaveRequestsArray.map((request) => (
                <div key={request._id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{request.employeeName}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p><span className="font-medium">Type:</span> {request.leaveType}</p>
                    <p><span className="font-medium">Duration:</span> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.days} days)</p>
                    <p><span className="font-medium">Reason:</span> {request.reason}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleLeaveAction(request, 'approved')}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(request, 'rejected')}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              </div>
              
              {/* Desktop table */}
              <div className={`hidden lg:block ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
              <table className="w-full">
                <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {leaveRequestsArray.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{request.employeeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(request.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(request.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.days}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLeaveAction(request, 'approved')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(request, 'rejected')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Employees</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{employeesArray.length}</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Leave Requests</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{leaveRequestsArray.length}</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 01-1 1H8a1 1 0 110-2h4a1 1 0 011 1zm-1 4a1 1 0 100-2H8a1 1 0 100 2h4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Approved Requests</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{leaveRequestsArray.filter(req => req.status === 'approved').length}</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending Requests</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{leaveRequestsArray.filter(req => req.status === 'pending').length}</p>
                    </div>
                    <div className="bg-yellow-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Distribution Pie Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-sm border`}>
                  <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Department Distribution</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div 
                        className="w-64 h-64 rounded-full cursor-pointer transition-transform hover:scale-105" 
                        style={{
                          background: departments.length > 0 ? `conic-gradient(${
                            departments.map((dept, index) => {
                              const count = employeesArray.filter(emp => emp.department === dept).length;
                              const percentage = (count / employeesArray.length) * 100;
                              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                              const prevPercentages = departments.slice(0, index).reduce((sum, prevDept) => {
                                const prevCount = employeesArray.filter(emp => emp.department === prevDept).length;
                                return sum + (prevCount / employeesArray.length) * 100;
                              }, 0);
                              return `${colors[index % colors.length]} ${prevPercentages}% ${prevPercentages + percentage}%`;
                            }).join(', ')
                          })` : '#E5E7EB'
                        }}
                      >
                        <div className={`absolute inset-8 rounded-full flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{employeesArray.length}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {departments.map((dept, index) => {
                        const count = employeesArray.filter(emp => emp.department === dept).length;
                        const percentage = employeesArray.length > 0 ? ((count / employeesArray.length) * 100).toFixed(1) : 0;
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                        return (
                          <div key={dept} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: colors[index % colors.length]}}></div>
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{dept}</span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>({count} - {percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monthly Leave Usage Line Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-sm border`}>
                  <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Monthly Leave Usage</h3>
                  <div className="relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <line key={i} x1="40" y1={40 + i * 25} x2="380" y2={40 + i * 25} stroke="#f3f4f6" strokeWidth="1"/>
                      ))}
                      
                      {/* Y-axis labels */}
                      {[5, 4, 3, 2, 1, 0].map((val, i) => (
                        <text key={i} x="30" y={45 + i * 25} fontSize="10" fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} textAnchor="end">{val}</text>
                      ))}
                      
                      {/* Line chart */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={Array.from({length: 12}, (_, i) => {
                          const monthLeaves = leaveRequestsArray.filter(req => {
                            const reqMonth = new Date(req.startDate).getMonth();
                            return reqMonth === i && req.status === 'approved';
                          }).length;
                          const x = 50 + (i * 28);
                          const y = 165 - (monthLeaves * 25);
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {/* Data points */}
                      {Array.from({length: 12}, (_, i) => {
                        const monthLeaves = leaveRequestsArray.filter(req => {
                          const reqMonth = new Date(req.startDate).getMonth();
                          return reqMonth === i && req.status === 'approved';
                        }).length;
                        const x = 50 + (i * 28);
                        const y = 165 - (monthLeaves * 25);
                        
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#3b82f6"
                            className="cursor-pointer hover:r-6 transition-all"
                          />
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {Array.from({length: 12}, (_, i) => {
                        const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' });
                        const x = 50 + (i * 28);
                        return (
                          <text key={i} x={x} y="185" fontSize="10" fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} textAnchor="middle">
                            {month}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Salary Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Salary Distribution Bar Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-sm border`}>
                  <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Salary Distribution</h3>
                  <div className="relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 300 200">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1="40" y1={40 + i * 30} x2="280" y2={40 + i * 30} stroke="#f3f4f6" strokeWidth="1"/>
                      ))}
                      
                      {/* Y-axis labels */}
                      {['100K+', '75K', '50K', '25K', '0'].map((val, i) => (
                        <text key={i} x="30" y={45 + i * 30} fontSize="10" fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} textAnchor="end">₹{val}</text>
                      ))}
                      
                      {/* Salary range bars */}
                      {[
                        { range: '0-25K', min: 0, max: 25000, color: '#ef4444', x: 60 },
                        { range: '25-50K', min: 25000, max: 50000, color: '#f59e0b', x: 100 },
                        { range: '50-75K', min: 50000, max: 75000, color: '#10b981', x: 140 },
                        { range: '75K+', min: 75000, max: Infinity, color: '#3b82f6', x: 180 }
                      ].map((salaryRange, index) => {
                        const count = employeesArray.filter(emp => 
                          emp.salary && emp.salary >= salaryRange.min && 
                          (salaryRange.max === Infinity ? true : emp.salary < salaryRange.max)
                        ).length;
                        const maxCount = Math.max(1, employeesArray.length);
                        const height = (count / maxCount) * 120;
                        const y = 160 - height;
                        
                        return (
                          <g key={index}>
                            <rect
                              x={salaryRange.x}
                              y={y}
                              width="30"
                              height={height}
                              fill={salaryRange.color}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <text x={salaryRange.x + 15} y={y - 5} fontSize="10" fill={salaryRange.color} textAnchor="middle" fontWeight="bold">
                              {count}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {['0-25K', '25-50K', '50-75K', '75K+'].map((label, i) => (
                        <text key={i} x={75 + i * 40} y="185" fontSize="9" fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} textAnchor="middle">
                          {label}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Department Average Salary */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-sm border`}>
                  <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Average Salary by Department</h3>
                  <div className="space-y-4">
                    {departments.map((dept, index) => {
                      const deptEmployees = employeesArray.filter(emp => emp.department === dept && emp.salary);
                      const avgSalary = deptEmployees.length > 0 
                        ? deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length 
                        : 0;
                      const maxAvgSalary = Math.max(1, ...departments.map(d => {
                        const dEmps = employeesArray.filter(emp => emp.department === d && emp.salary);
                        return dEmps.length > 0 ? dEmps.reduce((sum, emp) => sum + emp.salary, 0) / dEmps.length : 0;
                      }));
                      const percentage = (avgSalary / maxAvgSalary) * 100;
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                      
                      return (
                        <div key={dept} className={`group cursor-pointer p-3 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{dept}</span>
                            <span className="text-sm font-bold text-green-600">₹{Math.round(avgSalary).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`flex-1 rounded-full h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div 
                                className="h-3 rounded-full transition-all duration-700" 
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: colors[index % colors.length]
                                }}
                              ></div>
                            </div>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{deptEmployees.length} emp</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Earners */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-sm border`}>
                  <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Earners</h3>
                  <div className="space-y-4">
                    {employeesArray
                      .filter(emp => emp.salary && emp.salary > 0)
                      .sort((a, b) => (b.salary || 0) - (a.salary || 0))
                      .slice(0, 5)
                      .map((employee, index) => {
                        const maxSalary = Math.max(...employeesArray.map(emp => emp.salary || 0));
                        const percentage = maxSalary > 0 ? (employee.salary / maxSalary) * 100 : 0;
                        const rankColors = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a'];
                        
                        return (
                          <div key={employee._id} className={`group flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`} 
                                   style={{backgroundColor: rankColors[index]}}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{employee.name}</div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employee.department}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">₹{employee.salary.toLocaleString()}</div>
                              <div className={`w-16 rounded-full h-2 mt-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <div 
                                  className="h-2 rounded-full transition-all duration-500" 
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: rankColors[index]
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              {/* Payroll Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Payroll</p>
                      <p className="text-2xl font-bold text-green-600">₹{employeesArray.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h10zM4 11a1 1 0 100 2h1a1 1 0 100-2H4zM15 11a1 1 0 100 2h1a1 1 0 100-2h-1z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Salary</p>
                      <p className="text-2xl font-bold text-blue-600">₹{employeesArray.length > 0 ? Math.round(employeesArray.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employeesArray.length).toLocaleString() : 0}</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Highest Paid</p>
                      <p className="text-2xl font-bold text-purple-600">₹{employeesArray.length > 0 ? Math.max(...employeesArray.map(emp => emp.salary || 0)).toLocaleString() : 0}</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                      <p className="text-2xl font-bold text-orange-600">{new Date().toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                    <div className="bg-orange-500 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee List */}
                <div className="lg:col-span-2">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
                    <div className="p-6 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-blue-600">Employee Payroll</h3>
                        <button
                          onClick={() => {
                            const csvData = [
                              ['Name', 'Employee ID', 'Department', 'Basic Salary', 'Net Salary'],
                              ...employeesArray.map(emp => [
                                emp.name,
                                emp.employeeId,
                                emp.department,
                                emp.salary || 0,
                                (emp.salary || 0) - Math.round((emp.salary || 0) * 0.22) // 22% total deduction
                              ])
                            ];
                            const csv = csvData.map(row => row.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `payroll-report-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          Export CSV
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name, ID, or department"
                        value={payrollFilter}
                        onChange={(e) => setPayrollFilter(e.target.value)}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {employeesArray
                        .filter(emp => 
                          !payrollFilter || 
                          emp.name?.toLowerCase().includes(payrollFilter.toLowerCase()) ||
                          emp.employeeId?.toLowerCase().includes(payrollFilter.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(payrollFilter.toLowerCase())
                        )
                        .map(employee => (
                          <div
                            key={employee._id}
                            onClick={() => {
                              setSelectedPayrollEmployee(employee);
                              setEmployeeBonus('');
                              setEmployeeAllowance('');
                              setEmployeeDeduction('');
                            }}
                            className={`p-4 border-b cursor-pointer transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            } ${
                              selectedPayrollEmployee?._id === employee._id 
                                ? theme === 'dark' 
                                  ? 'bg-gray-700 border-l-4 border-blue-500' 
                                  : 'bg-blue-50 border-l-4 border-blue-500' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                  {employee.profilePhoto ? (
                                    <img src={employee.profilePhoto} alt={employee.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                                      {employee.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{employee.name}</p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employee.employeeId} • {employee.department}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">₹{employee.salary?.toLocaleString() || 'N/A'}</p>
                                <p className="text-xs text-gray-500">Basic Salary</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Salary Details Panel */}
                <div className="lg:col-span-1">
                  {selectedPayrollEmployee ? (
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mx-auto mb-3">
                          {selectedPayrollEmployee.profilePhoto ? (
                            <img src={selectedPayrollEmployee.profilePhoto} alt={selectedPayrollEmployee.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                              {selectedPayrollEmployee.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayrollEmployee.name}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPayrollEmployee.employeeId} • {selectedPayrollEmployee.department}</p>
                      </div>

                      {/* Salary Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Basic Salary:</span>
                            <span className="font-bold text-blue-600">₹{selectedPayrollEmployee.salary?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Performance Bonus (₹)</label>
                          <input
                            type="number"
                            value={employeeBonus}
                            onChange={(e) => setEmployeeBonus(e.target.value)}
                            className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Allowances (₹)</label>
                          <input
                            type="number"
                            value={employeeAllowance}
                            onChange={(e) => setEmployeeAllowance(e.target.value)}
                            className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            placeholder="Travel, Medical, etc."
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Additional Deductions (₹)</label>
                          <input
                            type="number"
                            value={employeeDeduction}
                            onChange={(e) => setEmployeeDeduction(e.target.value)}
                            className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            placeholder="Loan, Advance, etc."
                          />
                        </div>

                        <div className="border-t pt-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between font-medium">
                              <span>Gross Salary:</span>
                              <span className="text-green-600">₹{((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)).toLocaleString()}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <div className="flex justify-between text-red-600">
                                <span>PF (12%):</span>
                                <span>-₹{Math.round((selectedPayrollEmployee.salary || 0) * 0.12).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Tax (10%):</span>
                                <span>-₹{Math.round(((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)) * 0.1).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Additional:</span>
                                <span>-₹{parseInt(employeeDeduction || 0).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg bg-green-50 p-3 rounded">
                              <span>Net Salary:</span>
                              <span className="text-green-600">₹{(
                                (selectedPayrollEmployee.salary || 0) + 
                                parseInt(employeeBonus || 0) + 
                                parseInt(employeeAllowance || 0) - 
                                Math.round((selectedPayrollEmployee.salary || 0) * 0.12) - 
                                Math.round(((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)) * 0.1) - 
                                parseInt(employeeDeduction || 0)
                              ).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                          <button
                            onClick={() => {
                              const payslipData = {
                                ...selectedPayrollEmployee,
                                bonus: parseInt(employeeBonus || 0),
                                allowance: parseInt(employeeAllowance || 0),
                                extraDeduction: parseInt(employeeDeduction || 0)
                              };
                              const payslip = generatePayslip(payslipData, employeeBonus);
                              const blob = new Blob([payslip], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Payslip-${selectedPayrollEmployee.employeeId}-${new Date().toISOString().split('T')[0]}.txt`;
                              a.click();
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                            Download Payslip
                          </button>
                          <button
                            onClick={() => {
                              const payslipHTML = `
                                <html>
                                  <head>
                                    <title>Payslip - ${selectedPayrollEmployee.name}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; margin: 20px; }
                                      .header { text-align: center; border: 2px solid #3B82F6; padding: 20px; margin-bottom: 20px; }
                                      .company-name { color: #3B82F6; font-size: 24px; font-weight: bold; margin: 0; }
                                      .payslip-title { text-align: center; color: #3B82F6; font-size: 20px; margin: 20px 0; }
                                      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                                      .section { background: #f9f9f9; padding: 15px; border-radius: 8px; }
                                      .section h3 { margin-top: 0; color: #333; }
                                      .salary-row { display: flex; justify-content: space-between; margin: 8px 0; }
                                      .deductions { background: #fef2f2; border-left: 4px solid #ef4444; }
                                      .net-salary { background: #f0fdf4; border-left: 4px solid #22c55e; font-weight: bold; font-size: 18px; }
                                      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                                      @media print { body { margin: 0; } }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <h1 class="company-name">CZARCORE</h1>
                                      <p>Employee Management System</p>
                                      <p>📧 contact@czarcore.com | 📞 +91-XXXXXXXXXX | 🌐 www.czarcore.com</p>
                                    </div>
                                    
                                    <h2 class="payslip-title">PAYSLIP - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                                    
                                    <div class="details-grid">
                                      <div class="section">
                                        <h3>Employee Details</h3>
                                        <div class="salary-row"><span>Name:</span><span>${selectedPayrollEmployee.name}</span></div>
                                        <div class="salary-row"><span>Employee ID:</span><span>${selectedPayrollEmployee.employeeId}</span></div>
                                        <div class="salary-row"><span>Department:</span><span>${selectedPayrollEmployee.department}</span></div>
                                        <div class="salary-row"><span>Position:</span><span>${selectedPayrollEmployee.position}</span></div>
                                        <div class="salary-row"><span>Date of Joining:</span><span>${selectedPayrollEmployee.dateOfJoining ? new Date(selectedPayrollEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}</span></div>
                                      </div>
                                      
                                      <div class="section">
                                        <h3>Salary Breakdown</h3>
                                        <div class="salary-row"><span>Basic Salary:</span><span>₹${(selectedPayrollEmployee.salary || 0).toLocaleString()}</span></div>
                                        <div class="salary-row"><span>Performance Bonus:</span><span>₹${parseInt(employeeBonus || 0).toLocaleString()}</span></div>
                                        <div class="salary-row"><span>Allowances:</span><span>₹${parseInt(employeeAllowance || 0).toLocaleString()}</span></div>
                                        <div class="salary-row" style="border-top: 1px solid #ccc; padding-top: 8px; font-weight: bold;">
                                          <span>Gross Salary:</span>
                                          <span>₹${((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div class="section deductions">
                                      <h3>Deductions</h3>
                                      <div class="salary-row"><span>Provident Fund (12%):</span><span>₹${Math.round((selectedPayrollEmployee.salary || 0) * 0.12).toLocaleString()}</span></div>
                                      <div class="salary-row"><span>Tax Deduction (10%):</span><span>₹${Math.round(((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)) * 0.1).toLocaleString()}</span></div>
                                      <div class="salary-row"><span>Additional Deductions:</span><span>₹${parseInt(employeeDeduction || 0).toLocaleString()}</span></div>
                                      <div class="salary-row" style="border-top: 1px solid #ccc; padding-top: 8px; font-weight: bold;">
                                        <span>Total Deductions:</span>
                                        <span>₹${(Math.round((selectedPayrollEmployee.salary || 0) * 0.12) + Math.round(((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)) * 0.1) + parseInt(employeeDeduction || 0)).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div class="section net-salary">
                                      <div class="salary-row">
                                        <span>NET SALARY:</span>
                                        <span>₹${(
                                          (selectedPayrollEmployee.salary || 0) + 
                                          parseInt(employeeBonus || 0) + 
                                          parseInt(employeeAllowance || 0) - 
                                          Math.round((selectedPayrollEmployee.salary || 0) * 0.12) - 
                                          Math.round(((selectedPayrollEmployee.salary || 0) + parseInt(employeeBonus || 0) + parseInt(employeeAllowance || 0)) * 0.1) - 
                                          parseInt(employeeDeduction || 0)
                                        ).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div class="footer">
                                      <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                                      <p>This is a computer-generated payslip and does not require a signature.</p>
                                      <p><strong>Thank you for your service! - CZARCORE</strong></p>
                                    </div>
                                  </body>
                                </html>
                              `;
                              const printWindow = window.open('', '_blank');
                              printWindow.document.write(payslipHTML);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => printWindow.print(), 500);
                            }}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0h8v2H6v-2z" clipRule="evenodd"/>
                            </svg>
                            Print Payslip
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h10zM4 11a1 1 0 100 2h1a1 1 0 100-2H4zM15 11a1 1 0 100 2h1a1 1 0 100-2h-1z"/>
                        </svg>
                      </div>
                      <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Select Employee</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Choose an employee to view salary details and generate payslip</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Admin Profile Section */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Admin Profile
                  </h3>
                  <p className="text-blue-100 mt-1">Manage your profile information and settings</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {adminProfile.photo ? (
                            <img 
                              src={adminProfile.photo} 
                              alt="Admin" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            adminProfile.name?.charAt(0) || 'A'
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setAdminProfile(prev => ({ ...prev, photo: e.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Profile Form */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Full Name</label>
                          <input
                            type="text"
                            value={adminProfile.name}
                            onChange={(e) => setAdminProfile(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full p-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            value={adminProfile.email}
                            onChange={(e) => setAdminProfile(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full p-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <input
                            type="tel"
                            value={adminProfile.phone}
                            onChange={(e) => setAdminProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className={`w-full p-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Department</label>
                          <input
                            type="text"
                            value={adminProfile.department}
                            onChange={(e) => setAdminProfile(prev => ({ ...prev, department: e.target.value }))}
                            className={`w-full p-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter your department"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                          value={adminProfile.bio}
                          onChange={(e) => setAdminProfile(prev => ({ ...prev, bio: e.target.value }))}
                          rows={2}
                          className={`w-full p-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                            if (currentUser && currentUser.id) {
                              localStorage.setItem(`adminProfile_${currentUser.id}`, JSON.stringify(adminProfile));
                            }
                            showPopup('success', 'Success!', 'Profile updated successfully!');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                            setAdminProfile({
                              name: currentUser.name || 'Admin User',
                              email: currentUser.email || 'admin@czarcore.com',
                              phone: '+1 234 567 8900',
                              department: 'Administration',
                              bio: 'System Administrator managing CzarCore Employee Management System.',
                              photo: null
                            });
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                            theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Appearance</h3>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">Theme</h4>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        theme === 'dark' 
                          ? 'bg-blue-600 focus:ring-blue-500' 
                          : 'bg-gray-300 focus:ring-gray-400'
                      }`}
                      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {theme === 'light' ? 'Light' : 'Dark'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Choose between light and dark mode</p>
                </div>
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Version</label>
                    <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>CzarCore EMS v1.0.0</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Updated</label>
                    <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                </h2>
                <button
                  onClick={closeHolidayModal}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Holiday Name *</label>
                <input
                  type="text"
                  name="name"
                  value={holidayForm.name}
                  onChange={handleHolidayChange}
                  placeholder="Enter holiday name"
                  required
                  className={`w-full p-3 border rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={holidayForm.date}
                  onChange={handleHolidayChange}
                  required
                  className={`w-full p-3 border rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                </button>
                {editingHoliday && (
                  <button
                    type="button"
                    onClick={() => handleHolidayDelete(editingHoliday)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeHolidayModal}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/30">
                    {selectedEmployee.profilePhoto && selectedEmployee.profilePhoto.trim() !== '' ? (
                      <img
                        src={selectedEmployee.profilePhoto}
                        alt={selectedEmployee.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                        {selectedEmployee.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                    <p className="text-blue-100">{selectedEmployee.position} • {selectedEmployee.department}</p>
                    <p className="text-blue-200 text-sm">ID: {selectedEmployee.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg text-center`}>
                  <div className="text-2xl font-bold text-blue-600">{selectedEmployee.availableLeaves}</div>
                  <div className="text-sm text-gray-500">Available Leaves</div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded-lg text-center`}>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEmployee.dateOfJoining ? Math.floor((new Date() - new Date(selectedEmployee.dateOfJoining)) / (1000 * 60 * 60 * 24 * 365)) : 0}
                  </div>
                  <div className="text-sm text-gray-500">Years of Service</div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'} p-4 rounded-lg text-center`}>
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedEmployee.dateOfBirth ? Math.floor((new Date() - new Date(selectedEmployee.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365)) : 0}
                  </div>
                  <div className="text-sm text-gray-500">Age</div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
                  <div className="text-2xl font-bold text-orange-600">
                    {leaveRequestsArray.filter(req => req.employeeId === selectedEmployee._id && req.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-500">Approved Leaves</div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg`}>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedEmployee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedEmployee.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="text-right">{selectedEmployee.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg`}>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Work Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Employee ID:</span>
                      <span className="font-mono">{selectedEmployee.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Department:</span>
                      <span>{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Position:</span>
                      <span>{selectedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span>{selectedEmployee.role || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Joining:</span>
                      <span>{selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Salary:</span>
                      <span className="font-semibold text-green-600">₹{selectedEmployee.salary ? selectedEmployee.salary.toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Work Email:</span>
                      <span className="text-blue-600">{selectedEmployee.workEmail || selectedEmployee.personalEmail || selectedEmployee.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Leave History */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg mt-6`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Recent Leave History
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {leaveRequestsArray
                    .filter(req => req.employeeId === selectedEmployee._id)
                    .slice(0, 5)
                    .map((request, index) => (
                      <div key={index} className={`flex justify-between items-center p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div>
                          <span className="font-medium">{request.leaveType}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  {leaveRequestsArray.filter(req => req.employeeId === selectedEmployee._id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No leave history found</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    handleEdit(selectedEmployee);
                    setShowEmployeeDetails(false);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Employee
                </button>
                <button
                  onClick={() => {
                    setShowEmployeeDetails(false);
                    handleDelete(selectedEmployee._id);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Delete Employee
                </button>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full transform animate-slideUp`}>
            <div className={`p-6 rounded-t-xl ${
              modalConfig.type === 'success' ? 'bg-green-600' :
              modalConfig.type === 'error' ? 'bg-red-600' :
              modalConfig.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {modalConfig.type === 'success' && (
                    <svg className="w-5 h-5 text-white animate-checkmark" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {modalConfig.type === 'error' && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {modalConfig.type === 'warning' && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {modalConfig.type === 'info' && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">{modalConfig.title}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                {modalConfig.message}
              </p>
              
              <div className="flex gap-3 justify-end">
                {modalConfig.showCancel && (
                  <button
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modalConfig.onConfirm) {
                      modalConfig.onConfirm();
                    }
                    closeModal();
                  }}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    modalConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    modalConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    modalConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default AdminPanel;