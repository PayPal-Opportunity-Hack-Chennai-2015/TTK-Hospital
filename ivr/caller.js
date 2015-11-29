'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/TTKHospital');
var moment = require('moment');
var hostConfig = require('./hostConfig.js');

var plivo = require('plivo');
var config = require('./secret.js');
var people = require('../model/people');
var DailyCallsModel = require('../model/dailyCalls');
var api = plivo.RestAPI(config.token);

console.log("a");
people.find({}, function(err, data) {
    if (err) {
        console.log("DB error while fetching all data\n");
        res.send({
            success: false,
            msg: "DB Error"
        });
    } else {
        makeCalls(data);
    }
});

function makeCalls(peopleArr) {
    var today = moment().format("MM/DD/YY"),
        nextCallDate = "", params;
    for (var i = 0; i < peopleArr.length; i++) {
        nextCallDate = moment(peopleArr[i].nextCallDate * 1000).format("MM/DD/YY");
        if ((true || nextCallDate === today) && peopleArr[i].person.name === "Mukesh") { // nextCallDate === today
            console.log(hostConfig.hostname + "callxml/" + peopleArr[i].languagePreference + '/self/' + peopleArr[i].bucket);
            console.log(hostConfig.hostname + peopleArr[i].languagePreference + '/relative/' + peopleArr[i].bucket);
            
            var dailyCallsModel = new DailyCallsModel();
            dailyCallsModel.personId = peopleArr[i].id;
            dailyCallsModel.person = peopleArr[i].person;
            dailyCallsModel.save(function(err, savedObject){
				if(err){
					console.log("Error creating a new daily call record " + err);
				}
				else{
					console.log("Daily call record created " + savedObject);
				}
			});
            params = {
                from: config.from,
                to: '+91' + peopleArr[i].person.phone,
                answer_url: hostConfig.hostname + 'callxml/' + peopleArr[i].languagePreference + '/self/' + peopleArr[i].bucket, // /call/:lang/:type/:level  eg //call/tamil/relative/0
            };
            api.make_call(params, logCallResponse);
            params = {
                from: config.from,
                to: '+91' + peopleArr[i].immediateFamily.phone,
                answer_url: hostConfig.hostname + 'callxml/' + peopleArr[i].languagePreference + '/relative/' + peopleArr[i].bucket, // /call/:lang/:type/:level  eg //call/tamil/relative/0
            };
            api.make_call(params, logCallResponse);
        }
    }
}

function logCallResponse(status, response) {
    if (status >= 200 && status < 300) {
        console.log('Successfully made call request.');
        console.log('Response:', response);
    } else {
        console.log('Oops! Something went wrong.');
        console.log('Status:', status);
        console.log('Response:', response);
    }
}
