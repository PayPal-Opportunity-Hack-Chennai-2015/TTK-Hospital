var express = require('express');
var router = express.Router();
var peopleModel = require('../model/people');
var patientMiddleware = require('../middleware/people');
var callUpdateMiddleware = require('../middleware/call');
var hostConfig = require('../ivr/hostConfig.js');

var plivo = require('plivo');
var ivrConfig = require('../ivr/ivrConfig.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Express' });

    res.sendFile(__dirname + "../public/index.html");
});



router.post('/people', function(req, res, next) {
    var requestType = req.body.action || null;
    if (requestType == null) {
        res.send({
            success: false,
            msg: "No action specified"
        });
        return;
    }

    if (requestType == "create")
        patientMiddleware.addNewPersonInformation(req, res);
    else
    if (requestType == "edit")
        patientMiddleware.edit(req, res);

});

router.post('/callxml/:lang/:calltype/:level', function(req, res, next) {
	console.log("%j %j", req.params, ivrConfig[parseInt(req.params.level)]);
    var response = plivo.Response();
    response.addSpeak(ivrConfig[parseInt(req.params.level)].message[req.params.lang][req.params.calltype]);
    var getDigits = response.addGetDigits({
        action: hostConfig.hostname + 'logCallResponse/' + req.params.calltype,
        method: 'GET',
        numDigits: 1,
        timeout: 10,
        retries: 2
    });
    getDigits.addSpeak('Enter 1 for Stable, 2 if you need support or 3 if you need personal intervention Please !!!');
    res.set('Content-Type', 'text/plain');
    res.end(response.toXML());
});

router.get('/logCallResponse/:type', function(req, res, next) {
    var response = plivo.Response();
    console.log("%j", req.query);
    var phoneNumber = req.query.To.substr(2);
    var digit = req.query.Digits;
    var type = req.params.type;
    var success = true;
    var insertObj = {time: Date.now(), response: digit, responder: type};
    callUpdateMiddleware.checkAndInsert(phoneNumber, insertObj, success, function(responseObj){
    	console.log(responseObj);
    });

    response.addSpeak('Your response has been noted. Thanks for your feedback.');
    res.set('Content-Type', 'text/plain');
    res.end(response.toXML());
});

router.post('/calllog', function (req, res, next) {
  var data = req.body,
    updateObjSelf = {
                        "response": data.response,
                        "responder": "self",
                        "bucket": data.bucket,
                        "time": Date.now()
                    },
    updateObjRelative = {
                            "response": data.response,
                            "responder": "relative",
                            "bucket": data.bucket,
                            "time": Date.now()
                        };

    console.log("data ", data.number);
  peopleModel.findOne({"person.phone": data.number}, function (err, response) {
    console.log("response = %j", response);
  });

  peopleModel.findOneAndUpdate({"person.phone": data.number}, {$push: {calls: updateObjSelf}}, function (err, response) {
    if (!err) {
      console.log("updated self successful");
    } else {
      console.log("error", err);
    }
  });
  peopleModel.findOneAndUpdate({"immediateFamily.phone": data.number}, {$push: {calls: updateObjRelative}}, function (err, response) {
    if (!err) {
      console.log("updated relative successful");
    } else {
      console.log("error", err);
    }
  });
  console.log("data is= ", data);
  res.status(201).send();

});

router.post('/call', function(req, res, next) {
    callUpdateMiddleware.updateCall(req, res);
});

router.post('/updateCall', function(req, res, next){
	callUpdateMiddleware.updateCall(req, res);
});

router.get('/getCallHistory/:id', function(req, res, next){
	callUpdateMiddleware.getCallHistory(req, res);
});

router.get('/fetchAllData', function(req, res, next) {
    console.log("inside fetch all data");
    patientMiddleware.fetchAllData(req, res);
});

router.get('/deleteRecord', function(req, res, next){
	patientMiddleware.deleteRecord(req, res);
});

module.exports = router;
