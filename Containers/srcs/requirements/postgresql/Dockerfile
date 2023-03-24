FROM postgres:15.2


RUN apt-get update && \
	apt-get install postgresql && \
	apt-get clean

RUN mkdir inoxdb

COPY Setup.sql /inoxdb/docker-entrypoint-initdb.d/

WORKDIR /inoxdb

ENTRYPOINT [ "/bin/bash", "-c", "psql -a -f ./docker-entrypoint-initdb.d/Setup.sql" ]

EXPOSE 5432