# Resource group
variable "resource_group_name" {
  type = string
}

# Keyvault
variable "keyvault_name" {
  type = string
}

# Roles
variable "keyvault_role_name" {
  type = string
}

variable "admin_username" {
  type = string
}

# Networking
variable "vnet_address_space" {
  type = set(string) 
}

variable "app_subnet_prefix" {
  type = list(string)
}

variable "data_subnet_prefix" {
  type = list(string)
}

# Compute
variable "vm_count" {
  type = number
}

variable "vm_size" {
  type = string
}

variable "vm_disk_size_gb" {
  type = number
}

variable "ssh_public_key_path" {
  type = string
}

# Security
variable "allowed_ssh_ips" {
  type = set(string)
}

variable "allowed_http_ips" {
  type = set(string)
}

variable "allowed_grpc_ips" {
  type = set(string)
}

# Load balancer
variable "health_probe_path" {
  type = string
}

variable "health_probe_interval" {
  type = number
}

variable "domain_name_label" {
  type = string
}

# Environment
variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "additional_tags" {
  type = object({})
}