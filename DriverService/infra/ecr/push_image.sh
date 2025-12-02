ROOT_DIR="$(cd .. && pwd)"
ECR_URL=$(terraform -chdir="$ROOT_DIR" output -raw ecr_repo_uri)
REGISTRY_URL="${ECR_URL%/*}"
IMAGE_NAME=$(terraform -chdir="$ROOT_DIR" output -raw image_name)

aws ecr get-login-password --region ap-southeast-2 \
| docker login --username AWS --password-stdin $REGISTRY_URL

docker tag $IMAGE_NAME $ECR_URL

docker push $ECR_URL