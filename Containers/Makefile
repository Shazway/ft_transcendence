all:
#	mkdir -p /home/ncaba/inception/data/frontend
#	mkdir -p /home/ncaba/inception/data/database
	docker compose -f srcs/docker-compose.yml up -d --build

stop:
	docker compose -f srcs/docker-compose.yml stop

# delete all exept images and cache
clean: stop
	docker compose -f srcs/docker-compose.yml down --volumes --remove-orphans

fclean: clean
	docker system prune -af --volumes 2> /dev/null

re: stop all

.PHONY: all stop clean fclean re