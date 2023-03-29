all:
	docker compose -f srcs/docker-compose.yml up -d --build

stop:
	docker compose -f srcs/docker-compose.yml stop

# delete all exept images and cache
clean: stop
	docker compose -f srcs/docker-compose.yml down --volumes --remove-orphans

fclean: clean
	docker system prune -af --volumes 2> /dev/null

re: stop all

BDD:
	docker compose -f srcs/docker-compose_only_bdd.yml up -d --build

.PHONY: all stop clean fclean re