FROM node:12.16.1-alpine As builder

WORKDIR /front

COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.15.8-alpine

COPY --from=builder /front/dist/frontend/ /front/share/nginx/html