# 実行方法

CattazはJavaScriptで実装されています。
様々な方法で実行することができます。

## Local

[Node 8](https://nodejs.org/en/download/)と[yarn](https://yarnpkg.com/en/docs/install)をインストールしてください。

```bash
yarn install
yarn start
```

上記コマンドを実行後、`http://localhost:8080/`にアクセスするとアプリケーションを見ることができます。

デフォルトのポート番号は、Webが8080でWebSocketが1234です。ポート番号を変えるには `yarn start` の代わりに `PORT_WEB=18080 PORT_WEBSOCKET=11234 yarn start` としてください。

## Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -it -p 8080:8080 -p 1234:1234 cattaz
```

上記コマンドを実行後、`http://localhost:8080/`にアクセスするとアプリケーションを見ることができます。

ポート番号を変えるには以下の例を参照してください、。

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

上記コマンドを実行後、`http://localhost:8080/`にアクセスするとアプリケーションを見ることができます。

ポート番号を変えるには `docker-compose up` の代わりに `PORT_WEB=18080 PORT_WEBSOCKET=11234 docker-compose up` としてください。

## Amazon EC2 Container Service

source treeの`aws-ecs.yaml`を参照してください。
