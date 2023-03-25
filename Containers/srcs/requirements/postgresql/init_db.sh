#!/bin/bash

set -e

# init user and db
psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB <<-EOSQL
	CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
	CREATE DATABASE $DB_NAME;
	GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

psql -a -f ./docker-entrypoint-initdb.d/Setup.sql -d $DB_NAME