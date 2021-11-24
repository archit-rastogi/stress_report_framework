#!/usr/bin/env bash

export SETUP_DB_FILE_PATH='/home/ec2-user/setup.sql'
export FILES_DIR='/home/ec2-user/files'
export DB_PATH='/home/ec2-user/db'

export SERVER_VERSION=latest
export FRONTEND_VERSION=latest
export FILES_VERISON=latest
export YUGABYTE_VERSION=latest

docker stack deploy -c docker-compose.yaml report
