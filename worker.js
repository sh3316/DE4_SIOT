var axios = require("axios");
var firebase = require("firebase/app");
require("firebase/database");
var schedule = require("node-schedule");
var puppeteer = require("puppeteer");
var moment = require("moment");

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

schedule.scheduleJob("0 */10 * * * *", async function() {
  try {
    var url = "";
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", interceptedRequest => {
      if (interceptedRequest.url().includes("forecast/aggregated/2643743")) {
        console.log(interceptedRequest.url());
        url = interceptedRequest.url();
      }
      interceptedRequest.continue();
    });

    await page.goto("https://www.bbc.com/weather/2643743");
    await browser.close();

    var { data } = await axios.get(url);
    var date = new Date();
    var selectedData = data.forecasts[0].detailed.reports[0];
    var parsedData = {
      humidity: selectedData.humidity,
      temperature: selectedData.temperatureC,
      date: date.getTime(),
      timestamp: moment(date).format("YYYY-MM-DD hh:mm"),
      weather: selectedData.weatherTypeText
    };
    firebase
      .database()
      .ref("weathers/")
      .push(parsedData);
    console.log("weather save", new Date());
  } catch (err) {
    console.log(err);
  }
});

schedule.scheduleJob("0 */10 * * * *", async function() {
  try {
    var url = "";
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", interceptedRequest => {
      if (interceptedRequest.url().includes("BikePoint")) {
        console.log(interceptedRequest.url());
        url = interceptedRequest.url();
      }
      interceptedRequest.continue();
    });

    await page.goto(
      "https://tfl.gov.uk/modes/cycling/santander-cycles/find-a-docking-station"
    );
    await browser.close();

    var result = await axios.get(url);
    var date = new Date();
    var reducedData = result.data.reduce(
      function(acc, cur) {
        if (
          isNaN(cur.additionalProperties[6].value) ||
          isNaN(cur.additionalProperties[8].value)
        ) {
          return acc;
        }

        var data = {
          count: parseInt(cur.additionalProperties[6].value),
          total: parseInt(cur.additionalProperties[8].value),
          name: cur.commonName
        };
        acc.data.push(data);
        acc.stopCount += 1;
        acc.total += data.total;
        acc.count += data.count;
        return acc;
      },
      {
        data: [],
        stopCount: 0,
        date: date.getTime(),
        timestamp: moment(date).format("YYYY-MM-DD hh:mm"),
        total: 0,
        count: 0
      }
    );
    firebase
      .database()
      .ref("bikes/")
      .push(reducedData);
    console.log("bike save", new Date());
  } catch (err) {
    console.log(err);
  }
});
