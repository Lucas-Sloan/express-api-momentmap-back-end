//middleware/verify-token.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
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
        // If any errors, send back a 401 status and an 'Invalid token.' error message
        res.status(401).json({ error: 'Invalid authorization token.' });
    }
}

module.exports = verifyToken;
