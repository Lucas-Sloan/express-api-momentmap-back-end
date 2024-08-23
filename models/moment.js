const mongoose = require('mongoose');
const { GuestSchema } = require('./guest');
const { ScheduleSchema } = require('./schedule');

const momentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String // URL or image path 
  },
  guests: [GuestSchema], 
  schedule: [ScheduleSchema], 
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true
});

const Moment = mongoose.model('Moment', momentSchema);

module.exports = Moment;