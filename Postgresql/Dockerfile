FROM postgres:15.2


ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
	apt-get install -y postgresql && \
	apt-get clean

RUN mkdir inoxdb

COPY init_db.sh /docker-entrypoint-initdb.d/

RUN chmod 755 /docker-entrypoint-initdb.d/init_db.sh

WORKDIR /inoxdb