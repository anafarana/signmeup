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

    // Creates a new course with the given name
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

    // Updates one or more properties of the given course
    router.put('/:course', function(request, response) {
        console.log('[', new Date(), ']\t', 'PUT /api/courses/:course');

        if(!request.params.hasOwnProperty('course')) {
            var error = {
                code: 400,
                msg: 'Query missing property titled \'course\''
            };

            console.error('[', new Date(), ']\t', error.msg);
            response.status(error.code).send(error).end();
            return;
        }

        var course = request.params.course;

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

            if(documents.length === 0) {
                var error = {
                    code: 400,
                    msg: course + ' does not exist in the DB'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            var dbCourse = documents[0];
            var isTypeError = false;
            var errorMsg = '[Type Error] Incorrect date type for new values of: ';

            if(request.body.hasOwnProperty('isQuestionMandatory') && typeof request.body.isQuestionMandatory === 'boolean') {
                dbCourse.isQuestionMandatory = request.body.isQuestionMandatory;
            } else if(request.body.hasOwnProperty('isQuestionMandatory') && typeof request.body.isQuestionMandatory !== 'boolean') {
                isTypeError = true;
                errorMsg += 'isQuestionMandatory (expected boolean)';
            }

            if(request.body.hasOwnProperty('isRemoteSignupEnabled') && typeof request.body.isRemoteSignupEnabled === 'boolean') {
                dbCourse.isRemoteSignupEnabled = request.body.isRemoteSignupEnabled;
            } else if(request.body.hasOwnProperty('isRemoteSignupEnabled') && typeof request.body.isRemoteSignupEnabled !== 'boolean') {
                isTypeError = true;
                errorMsg += 'isRemoteSignupEnabled (expected boolean)';
            }

            if(request.body.hasOwnProperty('turnTime') && typeof request.body.turnTime === 'number') {
                dbCourse.turnTime = request.body.turnTime;
            } else if(request.body.hasOwnProperty('turnTime') && typeof request.body.turnTime !== 'number') {
                isTypeError = true;
                errorMsg += 'turnTime (expected number)';
            }

            if(request.body.hasOwnProperty('isActive') && typeof request.body.isActive === 'boolean') {
                dbCourse.isActive = request.body.isActive;
            } else if(request.body.hasOwnProperty('isActive') && typeof request.body.isActive !== 'number') {
                isTypeError = true;
                errorMsg += 'isActive (expected boolean)';
            }

            dbCourse.save(function(saveError) {
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
                        course: dbCourse.course,
                        isQuestionMandatory: dbCourse.isQuestionMandatory,
                        isRemoteSignupEnabled: dbCourse.isRemoteSignupEnabled,
                        turnTime: dbCourse.turnTime,
                        isActive: dbCourse.isActive
                    }
                };

                if(isTypeError) {
                    result.error = errorMsg;
                }

                response.status(result.code).send(result).end();
            });
        });
    });

    // Deletes the course
    router.delete('/:course', function(request, response) {
        console.log('[', new Date(), ']\t', 'DELETE /api/courses/:course');

        if(!request.params.hasOwnProperty('course')) {
            var error = {
                code: 400,
                msg: 'Query missing property titled \'course\''
            };

            console.error('[', new Date(), ']\t', error.msg);
            response.status(error.code).send(error).end();
            return;
        }

        var course = request.params.course;

        CourseModel.remove({course: course}, function(removeError, isDeleteSuccessful) {
            if(removeError) {
                var error = {
                    code: 500,
                    msg: '[MongoDB Error] An error occurred while trying to remove the course.'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            if(!isDeleteSuccessful) {
                var error = {
                    code: 400,
                    msg: course + ' does not exist in the DB'
                };

                console.error('[', new Date(), ']\t', error.msg);
                response.status(error.code).send(error).end();
                return;
            }

            var result = {
                code: 200,
                result: 'Successfully deleted ' + course
            };

            response.status(result.code).send(result).end();
        });
    });

    return router;
};