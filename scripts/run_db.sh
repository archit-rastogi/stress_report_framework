#!/usr/bin/env bash

docker run -d \
  --name yugabyte \
  -p 5433:5433 \
  -p 9042:9042 \
  yugabytedb/yugabyte:2.17.3.0-b152 bin/yugabyted start --daemon=false
