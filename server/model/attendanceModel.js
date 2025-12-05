const mongoose = require("mongoose");

const attendanceDaySchema = new mongoose.Schema({
  inTime: String,
  outTime: String,
  times: [String],
  totalHours: Number,
});

const attendanceSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: { type: String, required: false },
  month: String, 
  attendance: {
    type: Map,
    of: attendanceDaySchema,
  },
  totalMonthlyHours: Number,
});

module.exports = mongoose.model("Attendance", attendanceSchema);
