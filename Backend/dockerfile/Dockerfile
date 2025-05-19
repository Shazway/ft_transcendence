FROM node:18.16.0-alpine3.17

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app
COPY ./package*.json /app/
RUN npm ci
COPY ./ /app/
CMD npm run migration:run && \
	npm run start