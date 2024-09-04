const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const SALT_LENGTH = 12;

router.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if the email or username is already taken
        const userInDatabase = await User.findOne({ $or: [{ email }, { username }] });
        if (userInDatabase) {
            return res.status(400).json({ error: 'Email or Username already taken.' });
        }

        // Create a new user with hashed password
        const hashedPassword = bcrypt.hashSync(password, SALT_LENGTH);
        const user = await User.create({
            email,
            username,
            hashedPassword
        });

        const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ user: { username: user.username, email: user.email, _id: user._id }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username only
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.hashedPassword)) {
            const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
