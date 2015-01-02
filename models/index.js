/**
 * Created by drawat on 12/26/14.
 */

// Modules + Globals
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Models
var CourseModel = require('./course')(mongoose, Schema);

module.exports = (function() {
    mongoose.connect('mongodb://localhost:27017/signmeup');     // change to config

    mongoose.connection.on('error', function(error) {
        if(error) {
            console.error('[', new Date(), ']\t', '[MongoDB Error] Cannot connect to the database (possible solution: check mongoose.connect(...))');
        }
    });

    return {
        Course: CourseModel
    };
})();