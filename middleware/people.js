'use strict';
var people = require('../model/people');
var uuid = require('node-uuid');
var moment = require('moment');
var ivrConfig = require('../ivr/ivrConfig');

function getKey(x){
	var matches = [];

	var pattern = /\[(.*?)\]/g;
	var match;
	while ((match = pattern.exec(x)) != null)
	{
	  matches.push(match[1]);
	}
	return matches[0];
}

function getField(x){
	var matches = [];

	var pattern = /\[(.*?)\]/g;
	var match;
	while ((match = pattern.exec(x)) != null)
	{
	  matches.push(match[1]);
	}
	return matches[1];
}


exports.addNewPersonInformation = function(req, res){

	var personName = req.body.personName || null;
	var personPhone = req.body.personPhone || null;
	var immediateFamilyName = req.body.immediateFamilyName || null;
	var immediateFamilyPhone = req.body.immediateFamilyPhone || null;
	var entryDate = moment(req.body.entryDate, 'YYYY-MM-DD').unix();
	console.log(entryDate);
	//var entryDate = 109029090210;
	var exitDate = moment(req.body.exitDate, 'YYYY-MM-DD').unix();
	console.log(exitDate);
	//var exitDate = 1912910290293;
	var bucket = req.body.bucket || null;
	var languagePreference = req.body.languagePreference || null;
	var status = req.body.status || null;
	var failedContactCount = 0;
	var id = uuid.v1();

	if(personName == null || personPhone == null){
		console.log("Incomplete patient information\n");
		res.send({success: false, msg: "Incomplete patient information"});
		return;
	}

	if(immediateFamilyName == null || immediateFamilyPhone == null){
		console.log("Incomplete support person information\n");
		res.send({success: false, msg: "Incomplete support person information"});
		return;
	}

	if(bucket != null){
		console.log("Bucket " + bucket);
		var callingFrequency = ivrConfig[bucket].callingFrequency;
		console.log("Calling Frequency is " + callingFrequency);
		var nextCallDate = new Date();
		nextCallDate.setDate(nextCallDate.getDate() + callingFrequency);
		console.log("Next Call Date" + nextCallDate.getTime());
	}

	var patientInfo = new people({
		id : id,
		person : {
			name : personName,
			phone : personPhone
		},
		immediateFamily : {
			name : immediateFamilyName,
			phone: immediateFamilyPhone
		},
		entryDate : entryDate,
		exitDate : exitDate,
		bucket : bucket,
		languagePreference : languagePreference,
		failedContactCount : failedContactCount,
		status : status,
		nextCallDate : nextCallDate.getTime(),
	});

	console.log(patientInfo);

	patientInfo.save(function(err, savedObject){
		if(err){
			console.log("Error creating a new patient record " + err);
			res.send({success : false, msg: "DB error"});
		}
		else{
			console.log("Patient record created" + savedObject);
			//res.send({success : true});
			res.redirect('/index.html');
		}
	});
};

exports.edit = function(req, res){
	console.log(req.body);
	/*var body = req.body;
	delete body.action;

	var updateData = {};
	for (var key in body) {
		var id = getKey(key);
		var fieldName = getField(key);
		if(fieldName == "personName"){

		}
		console.log(id + " " + fieldName);
		updateData[fieldName] = body[key];
	}*/

	var personName = req.body.personName || null;
	var personPhone = req.body.personPhone || null;
	var immediateFamilyName = req.body.immediateFamilyName || null;
	var immediateFamilyPhone = req.body.immediateFamilyPhone || null;
	var entryDate = moment(req.body.entryDate, 'YYYY-MM-DD').unix();
	console.log(entryDate);
	//var entryDate = 109029090210;
	var exitDate = moment(req.body.exitDate, 'YYYY-MM-DD').unix();
	console.log(exitDate);
	var bucket = req.body.bucket || null;
	var status = req.body.status || null;
	var languagePreference = req.body.languagePreference || null;
	var id = req.body.id || null;
	console.log("PAPAP" + id);
	if(personName == null || personPhone == null){
		console.log("Incomplete patient information\n");
		res.send({success: false, msg: "Incomplete patient information"});
		return;
	}

	if(immediateFamilyName == null || immediateFamilyPhone == null){
		console.log("Incomplete support person information\n");
		res.send({success: false, msg: "Incomplete support person information"});
		return;
	}

	if(bucket != null){
		var callingFrequency = ivrConfig[bucket].callingFrequency;
		console.log("Calling Frequency is " + callingFrequency);
		var nextCallDate = new Date();
		nextCallDate.setDate(nextCallDate.getDate() + callingFrequency);
		console.log("Next Call Date" + nextCallDate.getTime());
			
	}

	var updateData = new people({
		id : id,
		person : {
			name : personName,
			phone : personPhone
		},
		immediateFamily : {
			name : immediateFamilyName,
			phone: immediateFamilyPhone
		},
		entryDate : entryDate,
		exitDate : exitDate,
		bucket : bucket,
		status : status,
		languagePreference : languagePreference,
		nextCallDate : nextCallDate.getTime()
	});


	people.findOne({id: id}, function(err, doc){
	    if (err){
	    	console.log(err);
	    	res.send({success: false, msg: "update query failed"});
	    	return;
	    }
	    doc.person.name = personName;
	    doc.person.phone = personPhone;
	    doc.immediateFamily.name = immediateFamilyName;
	    doc.immediateFamily.phone = immediateFamilyPhone;
	    doc.entryDate = entryDate;
	    doc.exitDate = exitDate;
	    doc.bucket = bucket;
	    doc.status = status;
	    doc.languagePreference = languagePreference;
	    doc.nextCallDate = nextCallDate.getTime();
	    console.log(doc);
	    doc.save();
	    res.redirect('/index.html');
	    console.log(updateData);
	});
}

exports.fetchAllData = function(req, res){
	
	people.find({}, function(err, data){
		if(err){
			console.log("DB error while fetching all data\n");
			res.send({success: false, msg: "DB Error"});
		} else{
			console.log({data: data});
			res.send(data);
		}
	});
};

 exports.deleteRecord = function(req, res){
 	console.log("Called + "  + req.query.id);
 	var id = req.query.id;
 	people.find({id: id}, function(err, patient){
 		if(err){
 			 console.log(err);
 			res.send({success: false, msg: "DB error"});
 			return;
 		}
 		else {
 			if(patient){
	 			console.log(patient);
	 			people.remove({id: id}, function(err){
		 			if(err){
		 				console.log("Error removing record from DB");
		 				res.send({success: false, msg: "DB Error"});
		 			} else {
		 				console.log("record removed");
		 				res.send({success: true});
		 			}
	 			});
 			}
 		}
 	});
 };
