FROM node:lts

RUN apt-get update && \
	apt-get install -y build-essential && \
	apt-get clean && \
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash

WORKDIR /app

RUN rm -rf node_modules dist

RUN npm install @nestjs/cli && \
	npm install class-transformer --save && \
	npm install --save dotenv && \
	npm install --save @nestjs/typeorm typeorm pg

EXPOSE 3001

ENTRYPOINT [ "/bin/bash", "-c", "npm run start" ]