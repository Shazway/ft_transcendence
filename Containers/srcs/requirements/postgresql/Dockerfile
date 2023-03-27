FROM postgres:15.2


RUN apt-get update && \
	apt-get install postgresql && \
	apt-get clean

RUN mkdir inoxdb

COPY Setup.sql /inoxdb/
COPY init_db.sh /docker-entrypoint-initdb.d/

RUN chmod 755 /docker-entrypoint-initdb.d/init_db.sh

WORKDIR /inoxdb

EXPOSE 5432