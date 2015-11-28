'use strict';

var mongoose = require('mongoose');

var peopleModel = function() {
    var peopleSchema = mongoose.Schema({
        id: {
            type: String
        },
        person: {
            name: {
                type: String
            },
            phone: {
                type: String
            }
        },
        immediateFamily: {
            name: {
                type: String
            },
            phone: {
                type: String
            }
        },
        entryDate: {
            type: Number
        },
        exitDate: {
            type: Number
        },
        bucket: {
            type: Number
        },
        failedContactCount: {
            type: Number
        },
        status:{
            type: String
        },
        languagePreference: {
            type: String
        },
        calls: [{
            time: {
                type: Number
            },
            response: {
                type: Number
            },
            responder: {
                type: String
            }
        }],
        nextCallDate: {
            type: Number
        }
    });
    return mongoose.model('peopleModel', peopleSchema, 'people');
}

module.exports = new peopleModel();