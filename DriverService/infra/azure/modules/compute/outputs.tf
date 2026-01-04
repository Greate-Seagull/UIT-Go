output "identity_principal_ids" {
  value = azurerm_linux_virtual_machine.vm[*].identity[0].principal_id
}