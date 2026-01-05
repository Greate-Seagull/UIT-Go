resource "azurerm_key_vault" "kv" {
    name = var.name
    location = var.location
    resource_group_name = var.resource_group_name
    tenant_id = var.tenant_id
    sku_name = "standard"

    rbac_authorization_enabled = true
}