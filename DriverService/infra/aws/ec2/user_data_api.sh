#!/bin/bash
set -e

# Update all
echo "Update packages"
sudo apt update -y

# Installing unzip
echo "Installing unzip"
sudo apt install -y unzip

# Installing AWS CLI
echo "Installing AWS CLI"
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm awscliV2.zip

# Installing Docker
echo "Installing Docker"
sudo apt install -y docker.io
# Installing Docker compose
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -L https://github.com/docker/compose/releases/download/v2.40.3/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

REGION="${AWS_REGION:-ap-southeast-2}"
ACCOUNT_ID="${ECR_ACCOUNT_ID:-119994653133}"
REPO="${ECR_REPO:-server-driver-service}"
TAG="${IMAGE_TAG:-latest}"

ECR_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}"

# Login to ECR using instance role
echo "Login to ECR using instance role"
aws ecr get-login-password | sudo docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "user-data finished"