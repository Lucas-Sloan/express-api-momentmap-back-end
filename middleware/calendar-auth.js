//middleware/calendar-auth.js
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const router = express.Router();

// Set up session middleware
router.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'  // Redirect URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Route to initiate OAuth flow
router.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

// Route to handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  req.session.tokens = tokens;  // Save tokens in session

  res.redirect('/');  // Redirect to application after successful auth
});

// Example route to create an event
router.post('/create-event', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'User not authenticated' });

  oauth2Client.setCredentials(req.session.tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: 'New Event',
    start: {
      dateTime: '2024-09-30T10:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2024-09-30T12:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;