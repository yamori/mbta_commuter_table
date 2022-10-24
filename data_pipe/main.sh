#!/bin/bash

echo "## Starting the Data Pipeline Script"

# Referenced by JS scripts (process.env.*)
export TMP_DATA_DIR="../temp_data"

rm -rf $TMP_DATA_DIR
mkdir $TMP_DATA_DIR

# Processing: query for Stops within radius of GPS coord
node stopsWithinGPSRadius.js
# ouput
#  stopsFullDataWithinRadius.json

# Processing: read and parse stopsFullDataWithinRadius.json
node readStopData.js
# output
#  stopNamesKeyedByID.json
#  stopIDs.csv

export STOP_IDS_CSV=$(cat $TMP_DATA_DIR/stopIDs.csv)

# Process: query for routes which service stopIDs
node queryForRoutes.js
# ouput
#  routes.json
#  routeIDs.csv

export ROUTE_IDS_CSV=$(cat $TMP_DATA_DIR/routeIDs.csv)

# Processing: query for Schedules from routeIDs
node queryForSchdules.js
# output
#  validRides_morning.json