#!/usr/bin/env bash

export SETUP_DB_FILE_PATH='/Users/spilshchikov/workplace/git/yb-report/scripts/setup.sql'
export FILES_DIR='/Users/spilshchikov/workplace/trash/yb/report/files'
export DB_PATH='/Users/spilshchikov/workplace/trash/yb/report/db'

export SERVER_VERSION=latest
export FRONTEND_VERSION=latest
export FILES_VERISON=latest
export YUGABYTE_VERSION=latest

docker stack deploy -c docker-compose.yaml report
