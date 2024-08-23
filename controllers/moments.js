// controllers/moments.js
const express = require('express');
const router = express.Router();
const Moment = require('../models/moment');
const verifyToken = require('../middleware/verify-token');

// Route to create a new moment
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, date, location, image, guests, schedule } = req.body;

        // Create a new moment
        const moment = new Moment({
            title,
            description,
            date,
            location,
            image,
            guests,
            schedule,
            createdBy: req.user._id
        });

        // Save the moment to the database
        await moment.save();

        res.status(201).json(moment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;