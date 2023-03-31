FROM node:lts

RUN apt-get update && \
	apt-get install -y build-essential && \
	apt-get clean && \
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash

WORKDIR /app

CMD npm install @nestjs/cli && \
	npm install class-transformer --save && \
	npm install --save dotenv && \
	npm install --save @nestjs/typeorm typeorm pg && \
	npm install --save @nestjs/passport passport passport-local && \
	npm install --save-dev @types/passport-local && \
	npm install --save @nestjs/jwt passport-jwt && \
	npm run start:dev