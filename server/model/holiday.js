const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: String,
  date: Date,
  type: String,
  year: Number
});

module.exports = mongoose.model('Holiday', holidaySchema);
