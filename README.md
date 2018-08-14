# Cattaz

[![Build Status](https://travis-ci.org/FujitsuLaboratories/cattaz.svg?branch=master)](https://travis-ci.org/FujitsuLaboratories/cattaz)
[![codecov](https://codecov.io/gh/FujitsuLaboratories/cattaz/branch/master/graph/badge.svg)](https://codecov.io/gh/FujitsuLaboratories/cattaz)
[![Coverage Status](https://coveralls.io/repos/github/FujitsuLaboratories/cattaz/badge.svg?branch=master)](https://coveralls.io/github/FujitsuLaboratories/cattaz?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/4c3a48fb279c44d0ec7b/maintainability)](https://codeclimate.com/github/FujitsuLaboratories/cattaz/maintainability)
[![dependencies Status](https://david-dm.org/FujitsuLaboratories/cattaz/status.svg)](https://david-dm.org/FujitsuLaboratories/cattaz)
[![devDependencies Status](https://david-dm.org/FujitsuLaboratories/cattaz/dev-status.svg)](https://david-dm.org/FujitsuLaboratories/cattaz?type=dev)

![Cattaz](docs/assets/cattaz.png "Cattaz")

Cattaz is a realtime collaborative tool which can run custom applications in a Wiki page.

* [Project site](http://cattaz.io/)

## Features

* Wiki using Markdown with realtime preview and operational transformation
  * Try it in [sandbox page](http://cattaz.io/build/#/page/sandbox)
* Custom applications run in preview pane
  * For instance, you can drag-and-drop task cards in [Kanban](http://cattaz.io/build/#/doc/app-kanban)
  * To create your own, see [documentation on Hello World](http://cattaz.io/build/#/doc/app-hello) and [browse more in documentation](http://cattaz.io/build/#/doc/index)

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
docker run -it -p 8080:8080 -v $(pwd)/y-leveldb-databases:/usr/src/app/y-leveldb-databases cattaz
```

Now you can visit `http://localhost:8080/` to view the application.

### Docker Compose

```bash
# export http_proxy=http://user:pass@proxy.example.com:8080
# export https_proxy=http://user:pass@proxy.example.com:8080
docker-compose up
```

Now you can visit `http://localhost:8080/` to view the application.

## Links

* [Project site](http://cattaz.io/)
* [Demo site](http://cattaz.io/build/)
* [Documentation](http://cattaz.io/build/#/doc/index)
