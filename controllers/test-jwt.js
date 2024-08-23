//controllers/test-jwt.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/sign-token', (req, res) => {
    // Mock user object added
    const user = {
        _id: 1,
        username: 'test',
        email: 'test@example.com'
    };
    
    // Create a token using the sign method
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
});

router.post('/verify-token', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
});

module.exports = router;