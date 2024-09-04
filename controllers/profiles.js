const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        if (req.user._id !== req.params.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findById(req.user._id).select('-hashedPassword');
        if (!user) {
            res.status(404);
            throw new Error('Profile not found.');
        }
        res.json({ user });
    } catch (error) {
        res.status(res.statusCode === 404 ? 404 : 500).json({ error: error.message });
    }
});

module.exports = router;