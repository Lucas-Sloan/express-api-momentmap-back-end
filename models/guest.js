const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String 
  },
  RSVP: { 
    type: Boolean, 
    default: false 
  },
  plusOne: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = { GuestSchema: guestSchema, Guest };
