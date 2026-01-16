variable "vm_count" {
  type = number
}

variable "vm_size" {
  type = string
}

variable "vm_disk_size_gb" {
  type = number
}

variable "admin_username" {
  type = string
}

variable "name_prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "tags" {
  type = object({
    Environment = string
    Project     = string
    ManagedBy   = string
    Repository  = string
    DeployedAt  = string
  })
}

variable "subnet_id" {
  type = string
}

variable "ssh_public_key_path" {
  type = string
}

variable "environment" {
  type = string
}

variable "backend_address_pool_id" {
  type = string
}