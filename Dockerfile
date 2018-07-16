FROM node:8.11.1

ARG http_proxy
ARG https_proxy
ARG PORT=8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn && yarn cache clean
COPY . /usr/src/app

RUN yarn run cover
RUN yarn run build

EXPOSE 8080

CMD ["yarn", "run", "server"]
