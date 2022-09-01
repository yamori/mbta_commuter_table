'use strict';

require('dotenv').config();
var request = require('request');
var fs = require('fs'); 

var tempDataDir = process.env.TMP_DATA_DIR;

var commuterRailStops = 'https://api-v3.mbta.com/stops?filter%5Blatitude%5D=42.0789646082415&filter%5Blongitude%5D=-70.93261697530885&filter%5Bradius%5D=0.2&filter%5Broute_type%5D=2';

request.get({
    url: commuterRailStops,
    json: true,
    headers: {'User-Agent': 'request', 'x-api-key': process.env.MBTA_API_KEY, 'accept': 'application/vnd.api+json'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
      // data is already parsed as JSON:
      var stopsNames = data.data.map(a => a.attributes.name);
      console.log("\n","# Stop names");
      console.log(stopsNames);
      var stopsIDs = data.data.map(a => a.id);
      console.log("\n","# Stop IDs");
      console.log(stopsIDs);

      fs.writeFileSync(`${tempDataDir}/stopsFullDataWithinRadius.json`, JSON.stringify(data, null, 2) , 'utf-8');
    }
});