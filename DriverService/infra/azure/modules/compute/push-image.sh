IMAGE_NAME=server-driver-service
CR_URL="julian15/$IMAGE_NAME:latest"

docker tag $IMAGE_NAME $CR_URL
docker push $CR_URL