# Resource group
resource_group_name = "uit-go"

# Keyvault
keyvault_name = "driver-service-keyvault"

# Roles
keyvault_role_name = "Key Vault Secrets Officer"

# Networking
vnet_address_space   = ["10.0.0.0/16"]
app_subnet_prefix    = ["10.0.1.0/24"]
data_subnet_prefix   = ["10.0.2.0/24"]

# Compute
vm_size              = "Standard_B2ls_v2"
vm_count             = 2
vm_disk_size_gb      = 30
admin_username       = "azureuser"

# Security
allowed_ssh_ips      = ["0.0.0.0/0"]
allowed_http_ips     = ["0.0.0.0/0"]
allowed_grpc_ips     = ["0.0.0.0/0"]

# Load balancer
health_probe_path     = "/health"
health_probe_interval = 5
domain_name_label = "driver-service-prod"

# Environment
environment = "dev"
project_name = "driver-service"
additional_tags = {}