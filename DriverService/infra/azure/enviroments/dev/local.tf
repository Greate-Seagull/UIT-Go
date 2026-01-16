locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = merge(
    {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
      Repository  = "terraform-azure-docker"
      DeployedAt  = timestamp()
    },
    var.additional_tags
  )
}