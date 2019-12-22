var express = require('express');
var axios = require("axios");
var router = express.Router();
var moment = require("moment");
var firebase = require("firebase/app");
require("firebase/database");
var schedule =require("node-schedule");
var firebaseConfig = {
  apiKey: "AIzaSyBIcpjMvjZqKBI1uiXrOZGh010JmKoVNkE",
  authDomain: "de4-siot-dea1e.firebaseapp.com",
  databaseURL: "https://de4-siot-dea1e.firebaseio.com",
  projectId: "de4-siot-dea1e",
  storageBucket: "de4-siot-dea1e.appspot.com",
  messagingSenderId: "124628222598",
  appId: "1:124628222598:web:731979e8f889f1860e4707"
};

firebase.initializeApp(firebaseConfig)
schedule. scheduleJob("0 0 * * * *", async function(){
  try{
    var result = await axios.get(
      "https://weather-broker-cdn.api.bbci.co.uk/en/forecast/aggregated/2643743"
    );
       var target = result.data.forecasts[0].detailed.reports[0];
       var data = {
        humidity: parseInt(target.humidity),
        temperature: parseInt(target.temperatureC),
        timeslot: target.timeslot,
        weather: target.weatherTypeText,
        localDate: target.localDate
      }
      firebase.database().ref("weathers/").push(data);
      console.log("weather", new Date());
  }
  catch(err){
    console.log(err);
  }
})
schedule.scheduleJob("0 */10 * * * *", async function(){
  try{
    var result = await axios.get(
      "https://api-ganges.tfl.gov.uk/BikePoint?swLat=51.5022&swLon=-0.2225&neLat=51.5119&neLon=-0.0336&app_id=8268063a&app_key=14f7f5ff5d64df2e88701cef2049c804"
      );
      var reducedData = result.data.reduce(function(acc,cur){
        var data = {
          count: parseInt(cur.additionalProperties[6].value),
          total: parseInt(cur.additionalProperties[8].value),
          name: cur.commonName
        };
        acc.data.push(data)
        acc.total += data.total;
        acc.count += data.count;
        return acc;
      }, { data: [], date: new Date().getTime(), total: 0, count: 0})
      firebase
        .database()
        .ref("bikes/")
        .push(reducedData);
      console.log("save", new Date());
    } catch(err){
      console.log(err);
    }
})
router.get("/bikes", async function(req,res,next){
  console.log(req.query);
  var query = firebase
  .database()
  .ref("bikes/")
  .orderByChild("date")
  .startAt(
    moment(req.query.start_date)
    .toDate()
    .getTime()
  )
  .endAt(
    moment(req.query.end_date)
    .toDate()
    .getTime()
  );
query.once("value", function(snapshot) {
  res.send(snapshot);
})
})
router.get("/weathers", async function(req,res,next){
  try{
    var result = await axios.get(
      "https://weather-broker-cdn.api.bbci.co.uk/en/forecast/aggregated/2643743"
    );
       var target = result.data.forecasts[0].detailed.reports[0];
       var data = {
        humidity: parseInt(target.humidity),
        temperature: parseInt(target.temperatureC),
        timeslot: target.timeslot,
        weather: target.weatherTypeText,
        localDate: target.localDate
      }
      firebase.database().ref("weathers/").push(data);
      console.log("weather", new Date());
      res.send(data);
  }
  catch(err){
    console.log(err);
  }
})
/* GET home page. */
router.get('/',async function(req, res, next) {
  try{
    var result = await axios.get(
      "https://api-ganges.tfl.gov.uk/BikePoint?swLat=51.5022&swLon=-0.2225&neLat=51.5119&neLon=-0.0336&app_id=8268063a&app_key=14f7f5ff5d64df2e88701cef2049c804"
      );
      var reducedData = result.data.reduce(function(acc,cur){
        var data = {
          count: parseInt(cur.additionalProperties[6].value),
          total: parseInt(cur.additionalProperties[8].value),
          name: cur.commonName
        };
        acc.data.push(data)
        acc.total += data.total;
        acc.count += data.count;
        return acc;
      }, { data: [], date: new Date().getTime(), total: 0, count: 0})
      firebase
        .database()
        .ref("bikes/")
        .push(reducedData);
      console.log("save", new Date());
      res.send(reducedData);
    } catch(err){
      console.log(err);
      res.send(err);
    }
});

module.exports = router;
