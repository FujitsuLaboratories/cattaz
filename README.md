# Cattaz

[![Build Status](https://travis-ci.org/FujitsuLaboratories/cattaz.svg?branch=master)](https://travis-ci.org/FujitsuLaboratories/cattaz)
[![codecov](https://codecov.io/gh/FujitsuLaboratories/cattaz/branch/master/graph/badge.svg)](https://codecov.io/gh/FujitsuLaboratories/cattaz)
[![Coverage Status](https://coveralls.io/repos/github/FujitsuLaboratories/cattaz/badge.svg?branch=master)](https://coveralls.io/github/FujitsuLaboratories/cattaz?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/4c3a48fb279c44d0ec7b/maintainability)](https://codeclimate.com/github/FujitsuLaboratories/cattaz/maintainability)
[![dependencies Status](https://david-dm.org/FujitsuLaboratories/cattaz/status.svg)](https://david-dm.org/FujitsuLaboratories/cattaz)
[![devDependencies Status](https://david-dm.org/FujitsuLaboratories/cattaz/dev-status.svg)](https://david-dm.org/FujitsuLaboratories/cattaz?type=dev)

![Cattaz](docs/assets/cattaz.png "Cattaz")

Cattaz is a realtime collaborative tool which can run custom applications in a Wiki page.

## Features

* Wiki using Markdown with realtime preview and operational transformation
* Custom applications run in preview pane
  * E.g. [Kanban useace](https://www.youtube.com/watch?v=V7lqCuoK9Lw) ([ja](https://www.youtube.com/watch?v=vmm9y5bRehQ))

## Usage

### Local

Install [Node 14](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/getting-started/install).

```bash
yarn install
yarn start
```

Now you can visit `http://localhost:8080/` to view the application.

### Docker

```bash
docker build . -t cattaz # --build-arg http_proxy=http://user:pass@proxy.example.com:8080 --build-arg https_proxy=http://user:pass@proxy.example.com:8080
docker run -it -p 8080:8080 cattaz
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

* Project site `http://cattaz.io/` has been terminated
* [Some YouTube videos](https://www.youtube.com/channel/UCi7df3g6U6XJsOe7NwL24vg/videos)
