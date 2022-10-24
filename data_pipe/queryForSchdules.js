'use strict';

require('dotenv').config();
var request = require('request');
var fs = require('fs'); 

if (!("TMP_DATA_DIR" in process.env)) {
   console.log('Environment variable TMP_DATA_DIR is required but was not found');
   process.exit(1);
}
var tempDataDir = process.env.TMP_DATA_DIR;
var schedulessJSONFilename = "schedules.json";
// Output
var routesJSONFilename = "validRides_morning.json";

var debugpipe = process.argv.includes('debugpipe') ? true : false;

if (!debugpipe) {
   queryForSchedulesByRouteIDs();
} else {
   let rawdata = fs.readFileSync(`${tempDataDir}/${schedulessJSONFilename}`);
   let schedulesJSON = JSON.parse(rawdata);
   processScheduleJSON(schedulesJSON);
}


function queryForSchedulesByRouteIDs(routeIDs) {
   if (!("ROUTE_IDS_CSV" in process.env)) {
      console.log('Environment variable ROUTE_IDS_CSV is required but was not found');
      process.exit(1);
   }
   var RouteListCSV = process.env.ROUTE_IDS_CSV;
   
   var commuterRailSchedule = `https://api-v3.mbta.com/schedules?sort=departure_time&filter%5Broute%5D=${RouteListCSV}`;

   request.get({
      url: commuterRailSchedule,
      json: true,
      headers: {'User-Agent': 'request', 'x-api-key': process.env.MBTA_API_KEY, 'accept': 'application/vnd.api+json'}
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
         // data is already parsed as JSON:
         var scheduleJSON = data.data;
         fs.writeFileSync(`${tempDataDir}/${schedulessJSONFilename}`, JSON.stringify(scheduleJSON, null, 2) , 'utf-8');
   
         processScheduleJSON(scheduleJSON);
      }
   });
}



function processScheduleJSON(scheduleJSON) {
   if (!("STOP_IDS_CSV" in process.env)) {
      console.log('Environment variable STOP_IDS_CSV is required but was not found');
      process.exit(1);
   }

   // Grab the list of desired STOPs
   var stopsListArr = process.env.STOP_IDS_CSV.split(",");

   // var map1 = scheduleJSON.map(arr => arr["trip"]["data"]["id"]);
   var tripIDs_raw = scheduleJSON.map(function(a) {return a.relationships.trip.data.id;});
   var tripIDs = [...new Set(tripIDs_raw)].sort();

   function sortUTCAscending(a, b) {
      if (a.attributes.departure_time < b.attributes.departure_time) { return -1; }
      if (a.attributes.departure_time > b.attributes.departure_time) { return 1; }
      return 0;
   }

   function sortUTCAscending_v2(a, b) {
      // Same function as above but without middle 'attribute' key
      if (a.departure_time < b.departure_time) { return -1; }
      if (a.departure_time > b.departure_time) { return 1; }
      return 0;
   }

   

   // For the TRIP, accumulate valid rides (could be multiple)
   var validRides = {};
   var ridesCount = 0;

   // Iterate over every TRIP
   for (var j = 0; j < tripIDs.length; j++) {
      // Filter for the TRIP, and sort
      var filtered = scheduleJSON.filter(function(x) { return x.relationships.trip.data.id == tripIDs[j]; });
      filtered.sort(sortUTCAscending);

      var validRidesForTrip = {};

      // Traverse the TRIP
      for (var i = 0; i < filtered.length; i++) {
         
         if (stopsListArr.includes(filtered[i].relationships.stop.data.id)) {
            // A desired STOP is detected
            validRidesForTrip[filtered[i].relationships.stop.data.id] = {};
            validRidesForTrip[filtered[i].relationships.stop.data.id]["departure_time"] = filtered[i].attributes.departure_time;
         }

         if (i == (filtered.length - 1) && filtered[i].relationships.stop.data.id == "NEC-2287") {
            // The last STOP is South Station, capture the arrival_time for all entries in validRidesForTrip
            for (const [key, value] of Object.entries(validRidesForTrip)) {
               validRidesForTrip[key]["arrival_time"] = filtered[i].attributes.arrival_time;
            }
            break;
         } else if (i == (filtered.length - 1)) {
            // This TRIP does not terminate at South Station, clear out the rides object
            validRidesForTrip = {};
            break;
         }
         
      }

      // For the given Trip, entries from validRidesForTrip into validRides
      //  note: this is where StopIDs can be repeated
      for (const [key, value] of Object.entries(validRidesForTrip)) {
         if (!validRides.hasOwnProperty(key)) {
            // This stop doesn't exist yet, start the array
            validRides[key] = [];
         }
         validRides[key].push(value);
      }


      console.log(Object.keys(validRidesForTrip).length);
      ridesCount += Object.keys(validRidesForTrip).length;

   }

   // Sort the departure/arrival array under each STOP_id key
   var totalRideCount = 0;
   for (const [key, value] of Object.entries(validRides)) {
      validRides[key].sort(sortUTCAscending_v2);
      totalRideCount += validRides[key].length;
   }

   fs.writeFileSync(`${tempDataDir}/${routesJSONFilename}`, JSON.stringify(validRides, null, 2) , 'utf-8');
   console.log(validRides);
   console.log(`Ride count check: ${totalRideCount}/${ridesCount}`);

}