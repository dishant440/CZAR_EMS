const Attendance = require('../model/attendanceModel')

const createAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body;
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Optional: remove old month’s data before inserting new
    await Attendance.deleteMany({ month: "October-2025" });

    await Attendance.insertMany(attendanceData);
    res.status(201).json({ message: "Attendance uploaded successfully" });
  } catch (error) {
    console.error("Error uploading attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {createAttendance};
