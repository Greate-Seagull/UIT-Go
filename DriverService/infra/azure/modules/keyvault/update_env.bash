az keyvault secret set \
  --name driver-env \
  --vault-name driver-service-keyvault \
  --file .env.azure \
  --encoding utf-8