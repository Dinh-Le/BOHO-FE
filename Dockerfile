FROM node:16 as node
LABEL maintainer="dinhlespkt@gmail.com"
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=node /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]
