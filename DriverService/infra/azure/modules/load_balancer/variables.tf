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

variable "health_probe_path" {
  type = string
}

variable "health_probe_interval" {
  type = number
}

variable "domain_name_label" {
  type = string
}