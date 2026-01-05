variable "name_prefix" {
    type = string
}

variable "vnet_address_space" {
  type = set(string)
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

variable "app_subnet_prefix" {
  type = list(string)
}

variable "data_subnet_prefix" {
  type = list(string)
}