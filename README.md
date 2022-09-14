# MBTA Commuter Rail Table generator

An app/pipeline using the [MBTA v3 API](https://www.mbta.com/developers/v3-api).

The `data_pipe` directory is meant to be a procedural cull of data, eventually piped into a/the format for the FEnd.  Set the API key (`MBTA_API_KEY="blah"`) in `.env` and run `cd data_pipe; ./main.sh` (a heavily commented bash script with stages of JSON).  JS scripts make actual API queries and data sorting/mapping/sifting.

## Debug

The `data_pipe/main.sh` script is meant to be a pipe with stages of query and processing.

Each `.js` file will be built so it can be executed standalone if the previous step's data is available (JSON file or env var).

The convention is to run the file with the flag `debugpipe`, e.g. `node queryForRoutes.js debugpipe`.

## Dependencies

```
mbta_times $ node -v
v16.15.1
mbta_times $ npm -v
8.11.0
```