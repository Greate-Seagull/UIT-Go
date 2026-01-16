# Public IPs for SSH access to each VM
resource "azurerm_public_ip" "vm" {
  count               = var.vm_count
  name                = "${var.name_prefix}-vm-${count.index + 1}-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
  
  tags = merge(
    var.tags,
    {
      Instance = count.index + 1
    }
  )
}

# Network Interfaces
resource "azurerm_network_interface" "vm" {
  count               = var.vm_count
  name                = "${var.name_prefix}-vm-${count.index + 1}-nic"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm[count.index].id
  }

  tags = merge(
    var.tags,
    {
      Instance = count.index + 1
    }
  )
}

# Associate NICs with Load Balancer Backend Pool
resource "azurerm_network_interface_backend_address_pool_association" "vm" {
  count                   = var.vm_count
  network_interface_id    = azurerm_network_interface.vm[count.index].id
  ip_configuration_name   = "internal"
  backend_address_pool_id = var.backend_address_pool_id
}

# Virtual machines
resource "azurerm_linux_virtual_machine" "vm" {
  count                           = var.vm_count
  name                            = "${var.name_prefix}-vm-${count.index + 1}"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = var.vm_size
  admin_username                  = var.admin_username
  disable_password_authentication = true
  
  network_interface_ids = [
    azurerm_network_interface.vm[count.index].id,
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    name                 = "${var.name_prefix}-vm-${count.index + 1}-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = var.vm_disk_size_gb
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Cloud-init with template variables
  custom_data = base64encode(templatefile("${path.module}/cloud-init.yml", {
    instance_id = count.index + 1
    environment = var.environment
  }))

  boot_diagnostics {}

  identity {
    type = "SystemAssigned"
  }
  
  tags = merge(
    var.tags,
    {
      Instance = count.index + 1
      Hostname = "${var.name_prefix}-vm-${count.index + 1}"
    }
  )

  lifecycle {
    ignore_changes = [custom_data]
  }
}