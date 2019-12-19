var express = require('express');
var axios = require("axios");
var router = express.Router();

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
        acc.push(data)
        return acc;
      }, [])
      res.send(reducedData);
    } catch(err){
      console.log(err);
      res.send(err);
    }
});

module.exports = router;
