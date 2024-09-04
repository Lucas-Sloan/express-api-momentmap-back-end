//controllers/test-jwt.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Route to sign a JWT token for a real user
router.post('/sign-token', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch the user from the database
        const user = await User.findOne({ email });

        // If no user is found or password doesn't match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Create JWT token with user ID
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

        // Send the token back as a cookie
        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax', secure: true });
        res.status(200).json({ message: 'Token signed and sent as a cookie.' });
    } catch (error) {
        console.error('Error signing token:', error);
        res.status(500).json({ error: 'Server error while signing token.' });
    }
});

// Route to verify JWT token from cookies
router.post('/verify-token', (req, res) => {
    try {
        // Retrieve the JWT token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Send back decoded token data
        res.status(200).json({ decoded });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid authorization token.' });
    }
});

// Route to clear the JWT token (logout)
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;
