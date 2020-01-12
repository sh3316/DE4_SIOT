var express = require("express");
var firebase = require("firebase/app");
require("firebase/database");
var router = express.Router();

var firebaseConfig = {
  apiKey: "AIzaSyAXGY8IfuqAYSxbSzzcME0yEjJrj8wAT6g",
  authDomain: "de4-siot-e0742.firebaseapp.com",
  databaseURL: "https://de4-siot-e0742.firebaseio.com",
  projectId: "de4-siot-e0742",
  storageBucket: "de4-siot-e0742.appspot.com",
  messagingSenderId: "774326548974",
  appId: "1:774326548974:web:69e9394c7f05defe1976ff"
};

firebase.initializeApp(firebaseConfig);

router.get("/bikes", async function(req, res, next) {
  var query = firebase
    .database()
    .ref("bikes/")
    .orderByChild("date");

  query.once("value", function(snapshot) {
    res.send(snapshot);
  });
});

router.get("/weathers", async function(req, res, next) {
  var query = firebase
    .database()
    .ref("weathers/")
    .orderByChild("date");

  query.once("value", function(snapshot) {
    res.send(snapshot);
  });
});

router.get("/", async function(req, res, next) {
  try {
    res.send("Hi");
  } catch (err) {
    console.log("err");
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
