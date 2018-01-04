FROM node:8.9.4

# A workaround for yarn 1.3.2. It will be removed in next release of yarn.
# See <https://github.com/yarnpkg/yarn/pull/4761>.
RUN if [ -n "$http_proxy" ]; then yarn config set proxy $http_proxy; fi && if [ -n "$https_proxy" ]; then yarn config set https-proxy $http_proxy; fi

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn && yarn cache clean
COPY . /usr/src/app

RUN yarn run cover
RUN yarn run build

EXPOSE 1234 8080

CMD ["yarn", "run", "server"]
