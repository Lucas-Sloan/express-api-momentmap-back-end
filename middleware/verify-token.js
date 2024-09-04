//middleware/verify-token.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function verifyToken(req, res, next) {
    try {
        const token = req.cookies.token; 

        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the full user object from the database using the _id in the token payload
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        // Assign the full user object to req.user
        req.user = user;
        
        // Call next() to invoke the next middleware function
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid authorization token.' });
    }
}

module.exports = verifyToken;
