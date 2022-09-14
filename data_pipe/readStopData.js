'use strict';

require('dotenv').config();
const fs = require('fs');

var tempDataDir = process.env.TMP_DATA_DIR;

let rawdata = fs.readFileSync(`${tempDataDir}/stopsFullDataWithinRadius.json`);
let stopsDataArray = JSON.parse(rawdata).data;

var stopsByIDObject = {};
for (var i = 0; i < stopsDataArray.length; i++) {
   stopsByIDObject[stopsDataArray[i].id] = {'name': stopsDataArray[i].attributes.name};
}

console.log("\n","# Stop obj keyed by ID");
console.log(stopsByIDObject);
fs.writeFileSync(`${tempDataDir}/stopNamesKeyedByID.json`, JSON.stringify(stopsByIDObject, null, 2) , 'utf-8');

var stopIDsCSV = returnCSVStops(stopsByIDObject);
console.log("\n","## Stop IDs CSV");
console.log( stopIDsCSV );
fs.writeFileSync(`${tempDataDir}/stopIDs.csv`, stopIDsCSV , 'utf-8');

function returnCSVStops(stopsByIDObject) {
   return Object.keys(stopsByIDObject).join();
}