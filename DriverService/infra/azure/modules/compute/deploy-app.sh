cd /opt/deployment/app

az keyvault secret show \
  --vault-name driver-service-keyvault \
  --name driver-env\
  --query value -o tsv > /opt/deployment/app/.env

docker compose down

curl -O https://raw.githubusercontent.com/Greate-Seagull/UIT-Go/main/DriverService/server/docker-compose.yml \
    --output-dir /opt/deployment/app
docker compose up -d --pull=always
docker system prune -a -f

# Run this once
docker compose run --rm redis-node1 redis-cli --cluster create \
  redis-node1:6379 redis-node2:6380 redis-node3:6381 \
  --cluster-replicas 0

chmod 600 /opt/myapp/.env

# Remove logs
sudo rm -rf logs
# Check cluster status
docker compose exec redis-node1 redis-cli cluster info
docker compose exec redis-node1 redis-cli SLOWLOG GET
# Other way to transfer file
scp D:\git-repo\backup\UIT-Go\DriverService\infra\azure\modules\compute\docker-compose.yml azureuser@4.194.48.154:/opt/deployment/app
scp D:\git-repo\backup\UIT-Go\DriverService\infra\azure\modules\compute\redis.conf azureuser@4.194.48.154:/opt/deployment/app