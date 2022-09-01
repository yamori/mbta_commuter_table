# MBTA Commuter Rail Table generator

An app/pipeline using the [MBTA v3 API](https://www.mbta.com/developers/v3-api).

The `data_pipe` directory is meant to be a procedural cull of data, eventually piped into a/the format for the FEnd.  Set the API key in `.env` and run `./main.sh` (heavily commented with stages of JSON).  JS scripts are run to make actual API queries and data sorting/mapping/sifting.

## Dependencies

```
mbta_times $ node -v
v16.15.1
mbta_times $ npm -v
8.11.0
```