'use strict';
var people = require('../model/people');


exports.updateCall = function(req, res) {
	console.log(req.body);
	function getParam(key) {
		return req.body[key] || null;
	}
	var phoneNumber = getParam("phoneNumber");
	var response = getParam("response");
	var success = getParam("success");

	if((phoneNumber && response && success) == null) {
		res.send({success: false, msg: "Incomplete call related information"});
	}
	people.findOne({"person.phone": phoneNumber}, function(err, data) {
		if(err) {
			console.log(err);
			res.send({success: false, msg: "No row found error"});
		} else {
			console.log(data);
			data.calls.push({time: Date.now(), response: response});
			if(success == true) {
				data.failedContactCount = 0;
			}
			data.save(function(err) {
				if(err) {
					res.send({success: false, msg: "No row update error"});
				} else {
					res.send({success: true});
				}
			});
		}
	});
}
