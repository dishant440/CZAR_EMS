const Holiday = require('../models/Holiday');

// Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get holidays by year
exports.getHolidaysByYear = async (req, res) => {
  try {
    const holidays = await Holiday.find({ year: req.params.year }).sort({ date: 1 });
    res.json(holidays);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add holiday
exports.addHoliday = async (req, res) => {
  try {
    const { name, date, type } = req.body;
    const year = new Date(date).getFullYear();

    const holiday = await new Holiday({ name, date, type, year }).save();
    res.status(201).json({ message: 'Holiday added successfully', holiday });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { name, date, type } = req.body;
    const year = new Date(date).getFullYear();

    const holiday = await Holiday.findByIdAndUpdate(req.params.id, { name, date, type, year }, { new: true });
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    res.json({ message: 'Holiday updated successfully', holiday });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    res.json({ message: 'Holiday deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
