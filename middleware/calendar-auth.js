//middleware/calendar-auth.js
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
  console.log('Initiating Google OAuth flow...');
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log(`Redirecting to Google Auth URL: ${authUrl}`);
  res.redirect(authUrl);
});

// Route to handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    console.log('Received Google OAuth callback with code:', code);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Google tokens received and credentials set:', tokens);

    // Retrieve the JWT token from the cookies
    const token = req.cookies.token;
    if (!token) {
      console.error('Authorization token missing in cookies.');
      return res.status(401).json({ error: 'Authorization token missing' });
    }
    console.log('Authorization token found in cookies.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    const user = await User.findById(decoded._id);
    if (!user) {
      console.error('User not authenticated.');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    console.log('User authenticated:', user.username);

    // Save the Google tokens in the user's profile
    user.googleCalendarToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleCalendarRefreshToken = tokens.refresh_token;
    }
    await user.save();
    console.log('Google tokens saved to user profile.');

    // Redirect back to the client application
    const redirectUrl = 'https://moment-map.netlify.app/calendar';
    console.log(`Redirecting back to client application: ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

module.exports = router;

