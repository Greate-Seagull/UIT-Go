terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
    }
  }

  # Backend configuration loaded from environments/{env}/backend.hcl
  # backend "azurerm" {
  #   resource_group_name  = "tf-state-rg"
  #   storage_account_name = "tfstate12345"
  #   container_name       = "terraform"
  #   key                  = "dev.tfstate"
  # }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    
    virtual_machine {
      delete_os_disk_on_deletion     = true
      skip_shutdown_and_force_delete = false
    }
  }
}