#!/bin/bash

echo "Downloading Apryse module for branch: $VERCEL_GIT_COMMIT_REF"
curl -o ./public/StructuredOutputModule.tar.gz https://www.pdftron.com/downloads/StructuredOutputLinuxArm64.tar.gz
tar -xzvf ./public/StructuredOutputModule.tar.gz
echo "Apryse Module downloaded successfully."
