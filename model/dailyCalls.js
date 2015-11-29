'use strict';

var mongoose = require('mongoose');

var dailyCallsModel = function() {
    var dailyCallsSchema = mongoose.Schema({
        person: {
            name: {
                type: String
            },
            phone: {
                type: String
            },
        },
        personId: {
            type: String
        }
    });
    return mongoose.model('dailyCallsModel', dailyCallsSchema, 'dailyCalls');
}

module.exports = new dailyCallsModel();