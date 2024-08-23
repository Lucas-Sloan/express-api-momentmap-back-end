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

// Route to get all moments for the authenticated user
router.get('/', verifyToken, async (req, res) => {
    try {
        // Find moments created by the authenticated user
        const moments = await Moment.find({ createdBy: req.user._id });

        // Return the moments
        res.status(200).json(moments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get a specific moment by ID
router.get('/:momentId', verifyToken, async (req, res) => {
    try {
        const moment = await Moment.findOne({ _id: req.params.momentId, createdBy: req.user._id });

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        res.status(200).json(moment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;