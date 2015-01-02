/**
 * SignMeUp (Server)
 * Built with love by Dhruv Rawat (drawat) & Anamta Farook (afarook)
 */

// Modules + Globals
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Setup
app.use(bodyParser.json());

// Routes
var courses = require('./routes/courses');

// Route Handling
app.use('/api/courses', courses.getRoutes());

// Hello, world!
app.listen('8080', function() {
    console.log('--- SignMeUp (Server)');
    console.log('--- Listening on Port 8080');
    console.log();
});