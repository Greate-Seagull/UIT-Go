module "keyvault" {
    source = "../../modules/keyvault"
    name = var.keyvault_name
    location = data.azurerm_resource_group.existing.location
    resource_group_name = data.azurerm_resource_group.existing.name
    tenant_id = data.azurerm_client_config.current.tenant_id
}

module "roles" {
    source = "../../modules/roles"
    keyvault_id = module.keyvault.id
    name = var.keyvault_role_name
    principal_id = data.azurerm_client_config.current.object_id
}

module "networking" {
    source = "../../modules/networking"
    
    name_prefix = local.name_prefix
    resource_group_name = data.azurerm_resource_group.existing.name
    location = data.azurerm_resource_group.existing.location

    vnet_address_space = var.vnet_address_space
    app_subnet_prefix = var.app_subnet_prefix
    data_subnet_prefix = var.data_subnet_prefix

    tags = local.common_tags
}

module "load_balancer" {
    source = "../../modules/load_balancer"

    name_prefix = local.name_prefix
    resource_group_name = data.azurerm_resource_group.existing.name
    location = data.azurerm_resource_group.existing.location
    domain_name_label = var.domain_name_label

    health_probe_interval = var.health_probe_interval
    health_probe_path = var.health_probe_path

    tags = local.common_tags
}

module "compute" {
    source = "../../modules/compute"
    name_prefix = local.name_prefix
    resource_group_name = data.azurerm_resource_group.existing.name
    location = data.azurerm_resource_group.existing.location
    environment = var.environment

    vm_size = var.vm_size
    vm_count = var.vm_count
    vm_disk_size_gb = var.vm_disk_size_gb
    admin_username = var.admin_username
    ssh_public_key_path = var.ssh_public_key_path

    subnet_id = module.networking.app_subnet_id
    backend_address_pool_id = module.load_balancer.backend_pool_id

    tags = local.common_tags
}

module "security" {
    source = "../../modules/security"

    name_prefix = local.name_prefix
    resource_group_name = data.azurerm_resource_group.existing.name
    location = data.azurerm_resource_group.existing.location

    app_subnet_id = module.networking.app_subnet_id

    allowed_ssh_ips = var.allowed_ssh_ips
    allowed_http_ips = var.allowed_http_ips
    allowed_grpc_ips = var.allowed_grpc_ips

    tags = local.common_tags
}

module "vm_readonly_kv" {
    source = "../../modules/roles"
    count = var.vm_count
    keyvault_id = module.keyvault.id
    name = "Key Vault Secrets User"
    principal_id = module.compute.identity_principal_ids[count.index]

    depends_on = [module.compute]
}