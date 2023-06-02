FROM node:18.16.0-alpine3.17

WORKDIR /app
COPY ./package*.json /app/
RUN npm ci
COPY ./ /app/
RUN npm run migration:run
RUN npm run start