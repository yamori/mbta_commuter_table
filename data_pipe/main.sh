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
#  