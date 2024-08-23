// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    googleCalendarToken: {
        type: String
    },
    calendarPreferences: {
        type: String
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('hashedPassword')) return next();
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
    next();
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    }
});

module.exports = mongoose.model('User', userSchema);