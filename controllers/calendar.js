//controllers/calendar.js
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const verifyToken = require('../middleware/verify-token');
const Moment = require('../models/moment');

// Middleware to ensure the user is authenticated
router.use(verifyToken);

// Sync all events with Google Calendar
router.post('/sync', async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: req.user.googleCalendarToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const moments = await Moment.find({ createdBy: req.user._id });

    for (const moment of moments) {
      const calendarEvent = {
        summary: moment.title,
        description: moment.description,
        location: moment.location,
        start: { dateTime: moment.date.toISOString(), timeZone: 'America/Los_Angeles' }, // Adjust time zone as needed
        end: { dateTime: new Date(new Date(moment.date).getTime() + 60 * 60 * 1000).toISOString(), timeZone: 'America/Los_Angeles' }, // Assuming 1 hour duration for each event
      };

      await calendar.events.insert({
        calendarId: 'primary',
        resource: calendarEvent,
      });
    }

    res.status(200).json({ message: 'Events synced with Google Calendar' });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    res.status(500).json({ error: 'Failed to sync with Google Calendar' });
  }
});

module.exports = router;
