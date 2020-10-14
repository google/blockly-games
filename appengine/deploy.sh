#!/bin/bash

# Script to deploy on GAE.

gcloud app deploy app.yaml --project blockly-games --version 3 --no-promote
