#!/bin/bash

echo 'Old deploy script disabled as a safety precaution.'
exit 0

# Script to deploy on GAE.

gcloud app deploy app.yaml --project blockly-games --version 3 --no-promote
