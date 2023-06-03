FROM node:18.16.0-alpine3.17 as builder
WORKDIR /front
COPY ./package*.json /front/
RUN npm ci
COPY ./ /front/

RUN npm run build -- --output-path=./dist/out --output-hashing=all

# Stage 2: Serve it using Ngnix
FROM nginx:stable-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY app.conf /etc/nginx/conf.d
COPY --from=builder /front/dist/out/ /usr/share/nginx/html
