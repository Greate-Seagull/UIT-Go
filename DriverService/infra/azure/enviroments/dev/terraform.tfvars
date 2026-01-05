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
vm_size              = "Standard_B1s"
vm_count             = 1
vm_disk_size_gb      = 30
admin_username       = "azureuser"

# Security
allowed_ssh_ips      = ["112.197.176.121/32"]
allowed_http_ips     = ["0.0.0.0/0"]

# Load balancer
health_probe_path     = "/health"
health_probe_interval = 5
domain_name_label = "driver-service-prod"

# Environment
environment = "dev"
project_name = "driver-service"
additional_tags = {}