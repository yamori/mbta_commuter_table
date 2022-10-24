'use strict';

require('dotenv').config();
var request = require('request');
var fs = require('fs'); 

if (!("TMP_DATA_DIR" in process.env)) {
   console.log('Environment variable TMP_DATA_DIR is required but was not found');
   process.exit(1);
}
var tempDataDir = process.env.TMP_DATA_DIR;
var routesJSONFilename = "routes.json";

var debugpipe = process.argv.includes('debugpipe') ? true : false;

if (!debugpipe) {
   queryForRoutesByStops();
} else {
   let rawdata = fs.readFileSync(`${tempDataDir}/${routesJSONFilename}`);
   let routesJSON = JSON.parse(rawdata);
   outputRouteIDs(routesJSON);
}

function queryForRoutesByStops() {
   if (!("STOP_IDS_CSV" in process.env)) {
      console.log('Environment variable STOP_IDS_CSV is required but was not found');
      process.exit(1);
   }
   var stopsListCSV = process.env.STOP_IDS_CSV;
   
   var commuterRailStops = `https://api-v3.mbta.com/routes?filter%5Bstop%5D=${stopsListCSV}&filter%5Btype%5D=2`;
   
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
         var routesJSON = data.data;
         fs.writeFileSync(`${tempDataDir}/${routesJSONFilename}`, JSON.stringify(routesJSON, null, 2) , 'utf-8');
   
         outputRouteIDs(routesJSON);
      }
   });
}

function outputRouteIDs(routesJSON) {
   var routeIDs = routesJSON.map(a => a.id);
   console.log("\n","## Route IDs CSV");
   console.log(routeIDs.join());
   fs.writeFileSync(`${tempDataDir}/routeIDs.csv`, routeIDs.join() , 'utf-8'); 
}