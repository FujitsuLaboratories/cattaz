#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

yarn run clean
yarn run lint
yarn run cover
