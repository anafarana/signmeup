/**
 * Created by drawat on 12/26/14.
 */

// Modules + Globals
var express = require('express');
var models = require('.././models');
var RoomModel = models.Room;
var Validator = require('../tools/validation');
var HandleError = require('../tools/createErrorResponse');
// Routes
exports.getRoutes = function() {
    var router = express.Router();

    // Adds the given room to the DB
    router.post('/', function(request, response) {
        console.log('[', new Date(), ']\t', 'POST /api/rooms');

        // TODO: Should check if this request was dispatched by an MTA?

        fields = ['name', 'IPAddress'];
        missingFields = Validator.getMissingFields(request.body, fields);
        if (missingFields.length !== 0) {
            message = 'Request body missing the following properties: ' + missingFields.join(', ');
            HandleError.returnError(400, message, response);
            return;
        }

        var name = request.body.name;
        var IPAddress = request.body.IPAddress;
        RoomModel.find({name: name}, function(findError, documents) {
            if(findError) {
                message = '[MongoDB Error] An error occurred while checking if the room already exists.';
                HandleError.returnError(500, message, response);
                return;
            }

            if(documents.length) {
                message = '[Duplicate] Room with same name already exists.';
                HandleError.returnError(400, message, response);
                return;
            }

            var newRoom = new RoomModel({name: name, IPAddress: IPAddress});

            newRoom.save(function(saveError, document) {
                if(saveError) {
                    message: '[MongoDB Error] An error occurred while trying to save the room.';
                    HandleError.returnError(400, message, response);
                    return;
                }

                var result = {
                    code: 200,
                    result: {
                        name: document.name,
                        IPAddress: document.IPAddress
                    }
                };

                response.status(result.code).send(result).end();
            });
        });
    });

    // Returns all info about a room (if a room name is specified in the query params)
    // Otherwise returns info about all rooms in the DB
    router.get('/', function(request, response) {
        console.log('[', new Date(), ']\t', 'GET /api/rooms');

        // TODO: check if MTA is requesting

        var dbQuery = {};

        if(request.query.hasOwnProperty('name')) {
            dbQuery.name = request.query.name;
        }

        RoomModel.find(dbQuery, function(findError, documents) {
            if(findError) {
                message: '[MongoDB Error] An error occurred while fetching all rooms.';
                HandleError.returnError(500, message, response);
                return;
            }

            var rooms = [];

            for(var i = 0; i < documents.length; i++) {
                var room = {
                    name: documents[i].name,
                    IPAddress: documents[i].IPAddress
                };

                rooms.push(room);
            }

            var result = {
                code: 200,
                result: rooms
            };

            response.status(result.code).send(result).end();
        });
    });

    // Updates one or more properties of given room
    router.put('/:room', function(request, response) {
        console.log('[', new Date(), ']\t', 'PUT /api/rooms/:room');

        // TODO: check if MTA is requesting

        var dbQuery = {};
        var fields = ['room'];
        var missingFields = Validator.getMissingFields(request.params, fields);
        if (missingFields.length !== 0) {
            'Request body missing the following properties: ' + missingFields.join(', ');
            HandleError.returnError(400, message, response);
            return;
        }

        var roomName = request.params.room;

        RoomModel.find({name: roomName}, function(findError, documents) {
            if(findError) {
                var message = '[MongoDB Error] An error occurred while checking if the room already exists.';
                HandleError.returnError(500, message, response);
                return;
            }

            if(documents.length === 0) {
                var message = roomName + ' does not exist in the DB';
                HandleError.returnError(500, message, response);
                return;
            }

            var dbRoom = documents[0];
            
            if (request.body.hasOwnProperty('name')) {
                dbRoom.name = request.body.name;
            }

            if (request.body.hasOwnProperty('IPAddress')) {
                dbRoom.IPAddress = request.body.IPAddress;
            }

            dbRoom.save(function(saveError) {
                if(saveError) {
                    var code = 500;
                    var message ='[MongoDB Error] An error occurred while trying to save the room.';
                    
                    if (saveError.name === 'CastError') {
                        message = '[Type Error] Cannot set \'' + saveError.path + '\' to \'' + saveError.value + '\'. Expected type \'' + saveError.type + '\'.'
                        code = 400;
                    }

                    HandleError.returnError(code, message, response);
                    return;
                }

                var result = {
                    code: 200,
                    result: {
                        name: dbRoom.name,
                        IPAddress: dbRoom.IPAddress
                    }
                };

                response.status(result.code).send(result).end();
            });
        });
    });

    // Deletes the course
    router.delete('/:room', function(request, response) {
        console.log('[', new Date(), ']\t', 'DELETE /api/rooms/:room');

        fields = ['room'];
        missingFields = Validator.getMissingFields(request.params, fields);
        if (missingFields.length !== 0) {
            var message = 'Query missing property titled \'room\'';
            HandleError.returnError(400, message, response);
            return;
        }

        var roomName = request.params.room;

        RoomModel.remove({name: roomName}, function(removeError, isDeleteSuccessful) {
            if(removeError) {
                var message = '[MongoDB Error] An error occurred while trying to remove the room.';
                HandleError.returnError(500, message, response);
                return;
            }

            if(!isDeleteSuccessful) {
                var message = roomName + ' does not exist in the DB';
                HandleError.returnError(500, message, response);
                return;
            }

            var result = {
                code: 200,
                result: 'Successfully deleted ' + roomName
            };

            response.status(result.code).send(result).end();
        });
    });

    return router;
};