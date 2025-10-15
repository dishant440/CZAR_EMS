const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  leaveType: String,
  fromDate: Date,
  toDate: Date,
  days: Number,
  reason: String,
  status: { type: String, default: 'Pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
