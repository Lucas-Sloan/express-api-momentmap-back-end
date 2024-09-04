//server.js
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const testJWTRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const profilesRouter = require('./controllers/profiles');
const momentsRouter = require('./controllers/moments');
const guestsRouter = require('./controllers/guests');
const calendarAuthRouter = require('./middleware/calendar-auth');
const calendarRouter = require('./controllers/calendar');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors({
    origin: ['https://moment-map.netlify.app', 'https://moment-map-1e3caa864534.herokuapp.com'],
    credentials: true,
}));

app.use(express.json());

// Define routes
app.use('/test-jwt', testJWTRouter);
app.use('/users', usersRouter);
app.use('/profiles', profilesRouter);
app.use('/moments', momentsRouter);
app.use('/guests', guestsRouter);
app.use('/', calendarAuthRouter);
app.use('/calendar', calendarRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});