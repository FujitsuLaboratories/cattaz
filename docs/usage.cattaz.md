# How to run

Cattaz is impletened with JavaScript.
You can run it in many ways.

## Local

Install [Node 8](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/en/docs/install).

```bash
yarn install
yarn start
```

Now you can visit `http://localhost:8080/` to view the application.

Default port for web is 8080 and default port for WebSocket is 1234. To change port numbers, use `PORT_WEB=18080 PORT_WEBSOCKET=11234 yarn start` instead of `yarn start`.

## Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -it -p 8080:8080 -p 1234:1234 cattaz
```

Now you can visit `http://localhost:8080/` to view the application.

To change port numbers, refer the example below:

```bash
docker build . -t cattaz --build-arg PORT_WEBSOCKET=11234
docker run -it -p 18080:8080 -p 11234:1234 cattaz
```

### Docker Compose

```bash
# export http_proxy=http://user:pass@proxy.example.com:8080
# export https_proxy=http://user:pass@proxy.example.com:8080
docker-compose up
```

Now you can visit `http://localhost:8080/` to view the application.

To change ports to be used, use `PORT_WEB=18080 PORT_WEBSOCKET=11234 docker-compose up` instead of `docker-compose up`.

## Amazon EC2 Container Service

See `aws-ecs.yaml` in the source tree.
