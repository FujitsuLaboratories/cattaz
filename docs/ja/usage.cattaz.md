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

## Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -it -p 8080:8080 -p 1234:1234 cattaz
```

上記コマンドを実行後、`http://localhost:8080/`にアクセスするとアプリケーションを見ることができます。

### Docker Compose

```bash
# export http_proxy=http://user:pass@proxy.example.com:8080
# export https_proxy=http://user:pass@proxy.example.com:8080
docker-compose up
```

上記コマンドを実行後、`http://localhost:8080/`にアクセスするとアプリケーションを見ることができます。

## Amazon EC2 Container Service

source treeの`aws-ecs.yaml`を参照してください。
