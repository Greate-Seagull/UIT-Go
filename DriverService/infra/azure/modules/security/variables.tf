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

variable "allowed_ssh_ips" {
  type = set(string)
}

variable "allowed_http_ips" {
  type = set(string)
}

variable "allowed_grpc_ips" {
  type = set(string)
}

variable "app_subnet_id" {
  type = string
}