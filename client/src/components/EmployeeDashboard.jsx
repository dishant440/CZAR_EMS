import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role === 'admin') {
        window.location.href = '/admin';
        return;
      }
    } else {
      window.location.href = '/auth';
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    fetchEmployees();
    fetchHolidays();
    fetchEmployeeProfile();
    fetchMyLeaveRequests();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/holidays');
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const fetchEmployeeProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employee/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmployeeProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMyLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employee/my-leave-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMyLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employee/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...leaveFormData,
          employeeId: employeeProfile?._id
        })
      });
      
      if (response.ok) {
        showToast('Leave request submitted successfully!', 'success');
        setLeaveFormData({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
        fetchMyLeaveRequests();
      } else {
        const data = await response.json();
        showToast(data.message || 'Error submitting leave request', 'error');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      phone: employeeProfile.phone || '',
      address: employeeProfile.address || '',
      profilePhoto: employeeProfile.profilePhoto || ''
    });
    setIsEditingProfile(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/employees/${employeeProfile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        showToast('Profile updated successfully!', 'success');
        setIsEditingProfile(false);
        fetchEmployeeProfile();
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employee/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('Password changed successfully!', 'success');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Error changing password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Error changing password', 'error');
    }
  };

  // Calendar helper functions (read-only for employees)
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
    const holiday = holidays.find(holiday => {
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

  if (!user) {
    return <div>Loading...</div>;
  }

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
                { id: 'profile', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>, label: 'My Profile' },
                { id: 'leave-request', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, label: 'Leave Request' },
                { id: 'payroll', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h10zM4 11a1 1 0 100 2h1a1 1 0 100-2H4zM15 11a1 1 0 100 2h1a1 1 0 100-2h-1z"/></svg>, label: 'My Payroll' },
                { id: 'holidays', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>, label: 'Holiday Calendar' },
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/auth';
              }}
              className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-red-700 text-white hover:bg-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="ml-64 flex-1 p-8 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'dashboard' && 'Employee Dashboard'}
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'leave-request' && 'Leave Request'}
                {activeTab === 'payroll' && 'My Payroll'}
                {activeTab === 'holidays' && 'Holiday Calendar'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Employee Dashboard</p>
            </div>
            
            {/* Employee Profile Header */}
            {employeeProfile && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="font-medium">{employeeProfile.name}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employeeProfile.position}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer" onClick={() => setActiveTab('profile')}>
                  {employeeProfile.profilePhoto && employeeProfile.profilePhoto.trim() !== '' ? (
                    <img 
                      src={employeeProfile.profilePhoto} 
                      alt={employeeProfile.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    employeeProfile.name?.charAt(0)?.toUpperCase() || 'E'
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Message */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border-l-4 border-blue-500`}>
                <h2 className="text-2xl font-bold text-blue-600 mb-1">
                  Hello, {employeeProfile?.name || user?.name || 'Employee'}!
                </h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Welcome to your dashboard
                </p>
              </div>

              {/* Available Leaves Highlight */}
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-800 to-green-600' : 'bg-gradient-to-r from-green-500 to-green-400'} p-6 rounded-xl shadow-lg text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Available Leave Balance</h3>
                    <p className="text-4xl font-bold">{employeeProfile?.availableLeaves || 0} days</p>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-green-200' : 'text-green-100'}`}>Remaining for this year</p>
                  </div>
                  <div className="text-6xl opacity-20">
                    📅
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Pending Requests', value: (Array.isArray(myLeaveRequests) ? myLeaveRequests.filter(req => req.status === 'pending').length : 0).toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>, color: 'bg-yellow-500', status: 'pending' },
                  { title: 'Approved Requests', value: (Array.isArray(myLeaveRequests) ? myLeaveRequests.filter(req => req.status === 'approved').length : 0).toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>, color: 'bg-green-500', status: 'approved' },
                  { title: 'Rejected Requests', value: (Array.isArray(myLeaveRequests) ? myLeaveRequests.filter(req => req.status === 'rejected').length : 0).toString(), icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>, color: 'bg-red-500', status: 'rejected' }
                ].map((stat, index) => (
                  <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer`} onClick={() => setActiveTab('leave-request')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Click to view details</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-full text-white`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setActiveTab('leave-request')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Request Leave
                  </button>
                  <button onClick={() => setActiveTab('profile')} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    View Profile
                  </button>
                  <button onClick={() => setActiveTab('payroll')} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    View Payslip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && employeeProfile && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/30">
                    {employeeProfile.profilePhoto && employeeProfile.profilePhoto.trim() !== '' ? (
                      <img
                        src={employeeProfile.profilePhoto}
                        alt={employeeProfile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                        {employeeProfile.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{employeeProfile.name}</h2>
                    <p className="text-blue-100">{employeeProfile.position} • {employeeProfile.department}</p>
                    <p className="text-blue-200 text-sm">ID: {employeeProfile.employeeId}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg text-center`}>
                    <div className="text-2xl font-bold text-blue-600">{employeeProfile.availableLeaves}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Available Leaves</div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded-lg text-center`}>
                    <div className="text-2xl font-bold text-green-600">
                      {employeeProfile.dateOfJoining ? Math.floor((new Date() - new Date(employeeProfile.dateOfJoining)) / (1000 * 60 * 60 * 24 * 365)) : 0}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Years of Service</div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'} p-4 rounded-lg text-center`}>
                    <div className="text-2xl font-bold text-purple-600">
                      {employeeProfile.dateOfBirth ? Math.floor((new Date() - new Date(employeeProfile.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365)) : 0}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Age</div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
                    <div className="text-2xl font-bold text-orange-600">
                      {Array.isArray(myLeaveRequests) ? myLeaveRequests.filter(req => req.status === 'approved').length : 0}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Approved Leaves</div>
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
                        <span>{employeeProfile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Date of Birth:</span>
                        <span>{employeeProfile.dateOfBirth ? new Date(employeeProfile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span>{employeeProfile.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Address:</span>
                        <span className="text-right">{employeeProfile.address || 'N/A'}</span>
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
                        <span className="font-mono">{employeeProfile.employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Department:</span>
                        <span>{employeeProfile.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Position:</span>
                        <span>{employeeProfile.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Role:</span>
                        <span>{employeeProfile.role || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Date of Joining:</span>
                        <span>{employeeProfile.dateOfJoining ? new Date(employeeProfile.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Salary:</span>
                        <span className="font-semibold text-green-600">₹{employeeProfile.salary ? employeeProfile.salary.toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Work Email:</span>
                        <span className="text-blue-600">{employeeProfile.workEmail || employeeProfile.personalEmail || employeeProfile.email}</span>
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
                    My Leave History
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.isArray(myLeaveRequests) && myLeaveRequests.length > 0 ? myLeaveRequests
                      .slice(0, 5)
                      .map((request, index) => (
                        <div key={index} className={`flex justify-between items-center p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                          <div>
                            <span className="font-medium">{request.leaveType}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(request.fromDate || request.startDate).toLocaleDateString()} - {new Date(request.toDate || request.endDate).toLocaleDateString()}
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
                      )) : (
                      <p className="text-gray-500 text-center py-4">No leave history found</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {isEditingProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full`}>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-blue-600">Edit Profile</h3>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditFormChange}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <textarea
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditFormChange}
                        rows="3"
                        className={`w-full p-3 border rounded-lg resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="Enter address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Photo URL</label>
                      <input
                        type="url"
                        name="profilePhoto"
                        value={editFormData.profilePhoto}
                        onChange={handleEditFormChange}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
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
            </div>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full`}>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-600">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        minLength="6"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className={`w-full p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
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
            </div>
          )}

          {/* Leave Request */}
          {activeTab === 'leave-request' && (
            <div className="space-y-8">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                <h2 className="text-2xl font-semibold mb-6 text-blue-600">Submit Leave Request</h2>
                <form onSubmit={handleLeaveSubmit} className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Leave Type</label>
                    <select
                      value={leaveFormData.leaveType}
                      onChange={(e) => setLeaveFormData({...leaveFormData, leaveType: e.target.value})}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="annual">Annual Leave</option>
                      <option value="emergency">Emergency Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>From Date</label>
                    <input
                      type="date"
                      value={leaveFormData.fromDate}
                      onChange={(e) => setLeaveFormData({...leaveFormData, fromDate: e.target.value})}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>To Date</label>
                    <input
                      type="date"
                      value={leaveFormData.toDate}
                      onChange={(e) => setLeaveFormData({...leaveFormData, toDate: e.target.value})}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Reason</label>
                    <textarea
                      value={leaveFormData.reason}
                      onChange={(e) => setLeaveFormData({...leaveFormData, reason: e.target.value})}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      rows="3"
                      placeholder="Please provide a reason for your leave request..."
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium">
                      Submit Leave Request
                    </button>
                  </div>
                </form>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                <h2 className="text-2xl font-semibold mb-6 text-blue-600">My Leave Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`border border-gray-300 p-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leave Type</th>
                        <th className={`border border-gray-300 p-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>From Date</th>
                        <th className={`border border-gray-300 p-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>To Date</th>
                        <th className={`border border-gray-300 p-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reason</th>
                        <th className={`border border-gray-300 p-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLeaveRequests.length > 0 ? myLeaveRequests.map((request) => (
                        <tr key={request._id} className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`border border-gray-300 p-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{request.leaveType}</td>
                          <td className={`border border-gray-300 p-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{new Date(request.fromDate).toLocaleDateString()}</td>
                          <td className={`border border-gray-300 p-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{new Date(request.toDate).toLocaleDateString()}</td>
                          <td className={`border border-gray-300 p-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{request.reason}</td>
                          <td className={`border border-gray-300 p-4`}>
                            <span className={`px-2 py-1 rounded text-sm ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className={`border border-gray-300 p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            No leave requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* My Payroll */}
          {activeTab === 'payroll' && employeeProfile && (
            <div className="space-y-6">
              {/* Salary Overview Card */}
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-800 to-green-600' : 'bg-gradient-to-r from-green-500 to-green-400'} p-8 rounded-xl shadow-lg text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Monthly Salary</h3>
                    <p className="text-4xl font-bold">₹{employeeProfile.salary ? employeeProfile.salary.toLocaleString() : 'N/A'}</p>
                    <p className="text-green-100 mt-2">Basic Salary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="text-6xl opacity-20">
                    💰
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                <h3 className="text-xl font-semibold mb-6 text-blue-600">Salary Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">Earnings</h4>
                    <div className="space-y-2">
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-green-800 text-white' : 'bg-green-50 text-gray-900'}`}>
                        <span>Basic Salary:</span>
                        <span className="font-semibold">₹{employeeProfile.salary ? employeeProfile.salary.toLocaleString() : 0}</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-50 text-gray-900'}`}>
                        <span>Allowances:</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-purple-800 text-white' : 'bg-purple-50 text-gray-900'}`}>
                        <span>Bonus:</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded font-bold ${theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-100 text-gray-900'}`}>
                        <span>Gross Salary:</span>
                        <span>₹{employeeProfile.salary ? employeeProfile.salary.toLocaleString() : 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-600">Deductions</h4>
                    <div className="space-y-2">
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-red-800 text-white' : 'bg-red-50 text-gray-900'}`}>
                        <span>PF (12%):</span>
                        <span className="font-semibold">₹{employeeProfile.salary ? Math.round(employeeProfile.salary * 0.12).toLocaleString() : 0}</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-orange-800 text-white' : 'bg-orange-50 text-gray-900'}`}>
                        <span>Tax (10%):</span>
                        <span className="font-semibold">₹{employeeProfile.salary ? Math.round(employeeProfile.salary * 0.1).toLocaleString() : 0}</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-900'}`}>
                        <span>Other Deductions:</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded font-bold ${theme === 'dark' ? 'bg-red-700 text-white' : 'bg-red-100 text-gray-900'}`}>
                        <span>Total Deductions:</span>
                        <span>₹{employeeProfile.salary ? Math.round(employeeProfile.salary * 0.22).toLocaleString() : 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Net Salary */}
                <div className="mt-6 p-6 bg-gradient-to-r from-green-500 to-green-400 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Net Salary (Take Home):</span>
                    <span className="text-3xl font-bold">₹{employeeProfile.salary ? Math.round(employeeProfile.salary * 0.78).toLocaleString() : 0}</span>
                  </div>
                </div>
              </div>

              {/* Generate Payslip */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
                <h3 className="text-xl font-semibold mb-6 text-blue-600">Download Payslip</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      const payslipHTML = `
                        <html>
                          <head>
                            <title>Payslip - ${employeeProfile.name}</title>
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
                                <div class="salary-row"><span>Name:</span><span>${employeeProfile.name}</span></div>
                                <div class="salary-row"><span>Employee ID:</span><span>${employeeProfile.employeeId}</span></div>
                                <div class="salary-row"><span>Department:</span><span>${employeeProfile.department}</span></div>
                                <div class="salary-row"><span>Position:</span><span>${employeeProfile.position}</span></div>
                                <div class="salary-row"><span>Date of Joining:</span><span>${employeeProfile.dateOfJoining ? new Date(employeeProfile.dateOfJoining).toLocaleDateString() : 'N/A'}</span></div>
                              </div>
                              
                              <div class="section">
                                <h3>Salary Breakdown</h3>
                                <div class="salary-row"><span>Basic Salary:</span><span>₹${(employeeProfile.salary || 0).toLocaleString()}</span></div>
                                <div class="salary-row"><span>Allowances:</span><span>₹0</span></div>
                                <div class="salary-row"><span>Bonus:</span><span>₹0</span></div>
                                <div class="salary-row" style="border-top: 1px solid #ccc; padding-top: 8px; font-weight: bold;">
                                  <span>Gross Salary:</span>
                                  <span>₹${(employeeProfile.salary || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div class="section deductions">
                              <h3>Deductions</h3>
                              <div class="salary-row"><span>Provident Fund (12%):</span><span>₹${Math.round((employeeProfile.salary || 0) * 0.12).toLocaleString()}</span></div>
                              <div class="salary-row"><span>Tax Deduction (10%):</span><span>₹${Math.round((employeeProfile.salary || 0) * 0.1).toLocaleString()}</span></div>
                              <div class="salary-row"><span>Other Deductions:</span><span>₹0</span></div>
                              <div class="salary-row" style="border-top: 1px solid #ccc; padding-top: 8px; font-weight: bold;">
                                <span>Total Deductions:</span>
                                <span>₹${Math.round((employeeProfile.salary || 0) * 0.22).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div class="section net-salary">
                              <div class="salary-row">
                                <span>NET SALARY:</span>
                                <span>₹${Math.round((employeeProfile.salary || 0) * 0.78).toLocaleString()}</span>
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
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0h8v2H6v-2z" clipRule="evenodd"/>
                    </svg>
                    Print Payslip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Holiday Calendar */}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-600">Holiday Calendar</h2>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View company holidays</p>
                  </div>
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
                        className={`p-3 text-center rounded-lg transition-all duration-200 relative ${
                          today
                            ? 'bg-blue-600 text-white font-bold'
                            : holiday || isSunday
                            ? theme === 'dark'
                              ? isSunday ? 'bg-purple-700 text-white' : 'bg-red-700 text-white'
                              : isSunday ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                            : theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-700'
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
                </div>
              </div>

              {/* Holiday List */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Holidays in {getMonthName(currentDate)}</h3>
                <div className="space-y-2">
                  {holidays
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
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  {holidays.filter(holiday => {
                    const holidayDate = new Date(holiday.date);
                    return holidayDate.getMonth() === currentDate.getMonth() && 
                           holidayDate.getFullYear() === currentDate.getFullYear();
                  }).length === 0 && (
                    <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No holidays in this month</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
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
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose between light and dark mode</p>
                </div>
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee ID</label>
                    <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>{employeeProfile?.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>{employeeProfile?.department || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
                <h3 className="text-lg font-semibold mb-4 text-green-600">Security</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Change your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
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

export default EmployeeDashboard;