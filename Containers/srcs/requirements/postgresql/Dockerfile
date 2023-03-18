FROM debian:buster

RUN apt-get update && \
	apt-get install mariadb-server -y && \
	apt-get clean

COPY docker-entrypoint.sh /
COPY 50-server.cnf /etc/mysql/mariadb.conf.d/

ENTRYPOINT ["bash", "docker-entrypoint.sh"]

CMD ["mysqld_safe"]

EXPOSE 3306