/**
 * Created by drawat on 12/26/14.
 */

// Modules + Globals
var express = require('express');
var models = require('.././models');
var CourseModel = models.Course;

// Routes
exports.getRoutes = function() {
    var router = express.Router();

    // Adds the given course to the DB
    router.post('/', function(request, response) {
        console.log('[', new Date(), ']\t', 'POST /api/courses');

        if(!request.body.hasOwnProperty('course')) {
            var error = {
                code: 400,
                msg: 'Request body missing property titled \'course\''
            };

            console.error('[', new Date(), ']\t', error.msg);
            response.status(error.code).send(error).end();
            return;
        }

        // TODO: Should we check if this request was dispatched by an MTA?

        var course = request.body.course;

        CourseModel.find({course: course}, function(findError, documents) {
            if(findError) {
                var error = {
                    code: 500,
                    msg: '[MongoDB Error] An error occurred while checking if the course already exists.'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            if(documents.length) {
                var error = {
                    code: 400,
                    msg: '[Duplicate] Course with same name already exists.'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            var newCourse = new CourseModel({course: course});

            newCourse.save(function(saveError, document) {
                if(saveError) {
                    var error = {
                        code: 500,
                        msg: '[MongoDB Error] An error occurred while trying to save the course.'
                    };

                    console.error('[', new Date(), ']\t', error.msg);
                    response.status(error.code).send(error).end();
                    return;
                }

                var result = {
                    code: 200,
                    result: {
                        course: document.course,
                        isQuestionMandatory: document.isQuestionMandatory,
                        isRemoteSignupEnabled: document.isRemoteSignupEnabled,
                        turnTime: document.turnTime,
                        isActive: document.isActive
                    }
                };

                response.status(result.code).send(result).end();
            });
        });
    });

    // Returns all info about a course (if a course name is specified in the query params)
    // Otherwise returns info about all courses in the DB
    router.get('/', function(request, response) {
        console.log('[', new Date(), ']\t', 'GET /api/courses');

        var dbQuery = {};

        if(request.query.hasOwnProperty('course')) {
            dbQuery.course = request.query.course;
        }

        CourseModel.find(dbQuery, function(findError, documents) {
            if(findError) {
                var error = {
                    code: 500,
                    msg: '[MongoDB Error] An error occurred while fetching all courses.'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            var courses = [];

            for(var i = 0; i < documents.length; i++) {
                var course = {
                    course: documents[i].course,
                    isQuestionMandatory: documents[i].isQuestionMandatory,
                    isRemoteSignupEnabled: documents[i].isRemoteSignupEnabled,
                    turnTime: documents[i].turnTime,
                    isActive: documents[i].isActive
                };

                courses.push(course);
            }

            var result = {
                code: 200,
                result: courses
            };

            response.status(result.code).send(result).end();
        });
    });

    return router;
};