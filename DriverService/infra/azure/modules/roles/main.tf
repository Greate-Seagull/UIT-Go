resource "azurerm_role_assignment" "keyvault_secrets_officer" {
    scope = var.keyvault_id
    role_definition_name = var.name
    principal_id = var.principal_id
}