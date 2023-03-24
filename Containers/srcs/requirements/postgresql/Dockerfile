FROM postgres:15.2

COPY 
COPY 50-server.cnf /etc/mysql/mariadb.conf.d/

ENTRYPOINT ["bash", "docker-entrypoint.sh"]

CMD ["mysqld_safe"]

EXPOSE 3306