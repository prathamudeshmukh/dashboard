#!/bin/bash

echo "Downloading Apryse module for branch: $VERCEL_GIT_COMMIT_REF"
curl -L "https://www.pdftron.com/downloads/StructuredOutputLinuxArm64.tar.gz" -o ./public/StructuredOutputModule.tar.gz

tar -xzvf ./public/StructuredOutputModule.tar.gz -C ./public
echo "Apryse Module downloaded successfully."
