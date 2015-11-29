'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/TTKHospital');
var moment = require('moment');

var people = require('../model/people');
var DailyCallsModel = require('../model/dailyCalls');

var ivrConfig = require('./ivrConfig.js');


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
    updateObj.bucket = person.bucket;
    if (calls.length === 0) {
        updateObj.failedContactCount = person.failedContactCount + 1;
    } else {
        if (moment(calls[calls.length - 1].time).format("MM/DD/YY") !== today) {
            console.log("For " + person.person.phone + " no call today");
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
        var uniqueDates = {};
        for (i = calls.length - 1; i >= 0; i--) {
            if (person.bucket !== calls[i].bucket)
                break;
            uniqueDates[moment(calls[i].time).format("MM/DD/YY") + i] = true;
        }
        console.log(uniqueDates, person.bucket, ivrConfig.length , ivrConfig[person.bucket]);

        if (person.bucket < ivrConfig.length && Object.keys(uniqueDates).length >= ivrConfig[person.bucket].promotionCount) {
            updateObj.bucket = person.bucket + 1;
        }
    }
    updateObj.nextCallDate = (person.bucket >= ivrConfig.length || updateObj.bucket >= ivrConfig.length)? 0 : person.nextCallDate + (ivrConfig[updateObj.bucket].callingFrequency * 24 * 60 * 60 * 1000);
    console.log(updateObj);
    people.findOneAndUpdate({
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

    DailyCallsModel.remove({}, function(err){
        console.log(err);
    });

}
