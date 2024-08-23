// controllers/guests.js
const express = require('express');
const router = express.Router();
const Moment = require('../models/moment');
const verifyToken = require('../middleware/verify-token');

router.get('/:momentId/guest/:guestId', async (req, res) => {
    try {
        const moment = await Moment.findOne({ _id: req.params.momentId });
        if (!moment) {
            return res.status(404).json({ error: 'Moment not found.' });
        }

        const guest = moment.guests.id(req.params.guestId);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found.' });
        }

        res.status(200).json({
            moment: {
                title: moment.title,
                description: moment.description,
                date: moment.date,
                location: moment.location,
                image: moment.image,
                schedule: moment.schedule,
            },
            guest: {
                firstName: guest.firstName,
                lastName: guest.lastName,
                RSVP: guest.RSVP,
                plusOne: guest.plusOne,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:momentId/guest/:guestId/rsvp', async (req, res) => {
    try {
        const { RSVP, plusOne } = req.body;

        const moment = await Moment.findOne({ _id: req.params.momentId });
        if (!moment) {
            return res.status(404).json({ error: 'Moment not found.' });
        }

        const guest = moment.guests.id(req.params.guestId);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found.' });
        }

        guest.RSVP = RSVP !== undefined ? RSVP : guest.RSVP;
        guest.plusOne = plusOne !== undefined ? plusOne : guest.plusOne;

        await moment.save();

        res.status(200).json({ message: 'RSVP updated successfully.', guest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;