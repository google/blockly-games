#!/bin/bash

# Script to deploy new version of Blockly Games on Google App Engine.

# Go to the directory containing this script.
cd "$(dirname "${BASH_SOURCE[0]}")"

PROJECT=blockly-games
VERSION=5

echo 'Beginning deployment...'
gcloud app deploy --project $PROJECT --version $VERSION --no-promote \
       app.yaml proxy/proxy-service.yaml dispatch.yaml
echo 'Deployment finished.'

