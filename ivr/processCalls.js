'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/TTKHospital');
var moment = require('moment');

var people = require('../model/people');
var DailyCallsModel = require('../model/dailyCalls');

DailyCallsModel.find({}, function(err, data) {
    if (err) {
        console.log("DB error while fetching all data\n");
    } else {
        processCalls(data);
    }
});

function processCalls(peopleArr) {
    for (var i = 0; i < peopleArr.length; i++)
        people.findOne({
            id: peopleArr[i].personId
        }, function(err, doc) {
            if (err) {
                console.log(err);
                return;
            } else {
                processPersonCallRecords(doc);
            }
        });
}

function processPersonCallRecords(person) {
    console.log(person);
    var calls = person.calls,
        i;
    var today = moment().format("MM/DD/YY");
    var updateObj = {};
    if (moment(calls[calls.length - 1].time).format("MM/DD/YY") !== today) {
        updateObj.failedContactCount = person.failedContactCount + 1;
    } else {
        var status1 = calls[calls.length - 1].response;
        var status2 = 0;
        if (calls.length > 1 && moment(calls[calls.length - 2].time).format("MM/DD/YY") === today) {
            //Last 2 calls have been successful and been made today
            status2 = calls[calls.length - 2].response;
        }
        updateObj.status = Math.max(status1, status2);
    }

    for (i = 0; i < calls.length; i++) {

    }

    MetaDataModel.findOneAndUpdate({
        id: person.id
    }, {
        $set: updateObj
    }, function(err, updateRes) {
        if (err) {
            console.log("Error while updating " + err);
        } else {
            console.log(updateRes);
        }
    });

}
