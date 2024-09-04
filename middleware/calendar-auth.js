const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cookieParser = require('cookie-parser');

router.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
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
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve the JWT token from the cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Save the Google tokens in the user's profile
    user.googleCalendarToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleCalendarRefreshToken = tokens.refresh_token;
    }
    await user.save();

    // Redirect back to the client application
    res.redirect('https://moment-map.netlify.app/calendar');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

module.exports = router;
