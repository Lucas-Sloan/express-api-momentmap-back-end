const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  time: { 
    type: String, 
    required: true 
  }, // Consider using Date for precise time
  eventDescription: { 
    type: String, 
    required: true 
  } // Renamed from `event` to `eventDescription` to avoid confusion
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = { ScheduleSchema: scheduleSchema, Schedule };