az keyvault secret show \
  --vault-name driver-service-keyvault \
  --name driver-env\
  --query value -o tsv > /opt/deployment/app/.env

curl -O https://raw.githubusercontent.com/Greate-Seagull/UIT-Go/main/DriverService/server/docker-compose.yml \
    --output-dir /opt/deployment/app

docker compose down
docker compose up -d --pull=always
docker system prune -a -f

chmod 600 /opt/myapp/.env