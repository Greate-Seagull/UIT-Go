ROOT_DIR=$(cd .. && pwd)
INSTANCE_ID=$(terraform -chdir="$ROOT_DIR" output -raw driver_service_instance_id)
COMPOSE_BUCKET=$(terraform -chdir="$ROOT_DIR" output -raw compose_bucket_name)
SECRET_NAME=$(terraform -chdir="$ROOT_DIR" output -raw app_secret_name)
REGION=${REGION:-ap-southeast-2}
ECR_URL=$(terraform -chdir="$ROOT_DIR" output -raw ecr_repo_uri)
REGISTRY_URL="${ECR_URL%/*}"

aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --region ap-southeast-2 \
  --parameters commands='[
    "set -e",
    "aws secretsmanager get-secret-value --secret-id '$SECRET_NAME' --region '$REGION' --query SecretString --output text > .env",
    "aws s3 cp s3://'$COMPOSE_BUCKET'/docker-compose.yml docker-compose.yml",
    "aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin '$REGISTRY_URL'",
    "sudo docker rm -f my-app",
    "sudo docker compose up -d --pull=always",
    "sudo docker system prune -a -f"
  ]'
