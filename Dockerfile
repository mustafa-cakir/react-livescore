FROM node:alpine as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN yarn install
COPY . /app
RUN yarn prod

FROM nginx:1.16.0-alpine
COPY --from=build /app/build /var/www


COPY nginx/nginx.conf /etc/nginx/nginx.conf
RUN apk add tzdata vim nano htop


CMD ["nginx", "-g", "daemon off;"]
