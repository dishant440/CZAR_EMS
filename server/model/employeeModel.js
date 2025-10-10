const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: String,
  personalEmail: String,
  workEmail: String,
  dateOfBirth: Date,
  dateOfJoining: Date,
  availableLeaves: { type: Number, default: 20 },
  department: String,
  position: String,
  role: { 
  type: String, 
  enum: ['Employee', 'Admin'], 
  default: 'Employee' 
},
  phone: String,
  address: String,
  profilePhoto: String,
  salary: Number,
  workPassword: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
