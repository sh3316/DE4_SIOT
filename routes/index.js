var express = require('express');
var axios = require("axios");
var router = express.Router();
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

schedule.scheduleJob("0 * * * * *", async function(){
  try{
    var result = await axios.get(
      "https://api-nile.tfl.gov.uk/BikePoint?swLat=51.4671&swLon=-0.2053&neLat=51.5469&neLon=-0.0508&app_id=8268063a&app_key=14f7f5ff5d64df2e88701cef2049c804"
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

/* GET home page. */
router.get('/',async function(req, res, next) {
  try{
    var result = await axios.get(
      "https://api-nile.tfl.gov.uk/BikePoint?swLat=51.4671&swLon=-0.2053&neLat=51.5469&neLon=-0.0508&app_id=8268063a&app_key=14f7f5ff5d64df2e88701cef2049c804"
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
