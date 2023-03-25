FROM postgres:15.2


RUN apt-get update && \
	apt-get install postgresql && \
	apt-get clean

RUN mkdir inoxdb

COPY Setup.sql /inoxdb/docker-entrypoint-initdb.d/
COPY init_db.sh /inoxdb/docker-entrypoint-initdb.d/

WORKDIR /inoxdb

ENTRYPOINT psql -a -f ./docker-entrypoint-initdb.d/init_db.sh

EXPOSE 5432