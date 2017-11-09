# Cattaz

TODO add badges of Travis, Code Climate, Codecov, Coveralls, and David.

Cattaz is a realtime collaborative Wiki platform. You can implement an application that runs in a Wiki page.

![Cattaz](docs/assets/cattaz.png "Cattaz")

* Project site (TODO link to landing page)
* Demo site (TODO link to build)
* Documentation (TODO link to documentation ./docs/index)
  * Documentation on Hello World (TODO link to documentation ./docs/app-hello)

## Usage

### Local

Install [Node 8](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/en/docs/install).

```bash
yarn install
yarn start
```

Now you can visit `http://localhost:8080/` to view the application.

### Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -it -p 8080:8080 -p 1234:1234 cattaz
```

Now you can visit `http://localhost:8080/` to view the application.
