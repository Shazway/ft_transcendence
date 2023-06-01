FROM node:lts

RUN apt-get update && \
	apt-get install -y build-essential && \
	apt-get clean && \
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash

WORKDIR /front

CMD npm install && \
	npm run build -- --prod && \
	npm run start -- --prod