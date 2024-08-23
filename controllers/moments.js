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

// Route to update a specific moment by ID
router.put('/:momentId', verifyToken, async (req, res) => {
    try {
        const { title, description, date, location, image, guests, schedule } = req.body;

        // Find the moment and ensure it belongs to the authenticated user
        const moment = await Moment.findOneAndUpdate(
            { _id: req.params.momentId, createdBy: req.user._id },
            { title, description, date, location, image, guests, schedule },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        res.status(200).json(moment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to delete a specific moment by ID
router.delete('/:momentId', verifyToken, async (req, res) => {
    try {
        const moment = await Moment.findOneAndDelete({ _id: req.params.momentId, createdBy: req.user._id });

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        res.status(200).json({ message: 'Moment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to add a schedule item to a specific moment
router.post('/:momentId/schedule', verifyToken, async (req, res) => {
    try {
        const { time, eventDescription } = req.body;

        // Find the moment by ID and ensure it belongs to the authenticated user
        const moment = await Moment.findOne({ _id: req.params.momentId, createdBy: req.user._id });

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        // Add the new schedule item to the moment's schedule
        moment.schedule.push({ time, eventDescription });

        // Save the updated moment
        await moment.save();

        res.status(201).json(moment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to update a specific schedule item within a moment
router.put('/:momentId/schedule/:scheduleId', verifyToken, async (req, res) => {
    try {
        const { time, eventDescription } = req.body;

        // Find the moment by ID and ensure it belongs to the authenticated user
        const moment = await Moment.findOne({ _id: req.params.momentId, createdBy: req.user._id });

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        // Find the specific schedule item by ID
        const scheduleItem = moment.schedule.id(req.params.scheduleId);

        if (!scheduleItem) {
            return res.status(404).json({ error: 'Schedule item not found.' });
        }

        // Update the schedule item with new data
        scheduleItem.time = time;
        scheduleItem.eventDescription = eventDescription;

        // Save the updated moment
        await moment.save();

        res.status(200).json(moment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to delete a specific schedule item within a moment
router.delete('/:momentId/schedule/:scheduleId', verifyToken, async (req, res) => {
    try {
        // Find the moment by ID and ensure it belongs to the authenticated user
        const moment = await Moment.findOne({ _id: req.params.momentId, createdBy: req.user._id });

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found or you do not have access to this moment.' });
        }

        // Find the index of the specific schedule item by ID
        const scheduleIndex = moment.schedule.findIndex(item => item._id.toString() === req.params.scheduleId);

        if (scheduleIndex === -1) {
            return res.status(404).json({ error: 'Schedule item not found.' });
        }

        // Remove the schedule item using splice
        moment.schedule.splice(scheduleIndex, 1);

        // Save the updated moment
        await moment.save();

        res.status(200).json({ message: 'Schedule item deleted successfully.', moment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;