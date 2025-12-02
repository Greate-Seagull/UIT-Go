locals {
  env_content = file("${path.module}/ec2.env")
}

resource "aws_secretsmanager_secret" "app_env" {
  name = "app-env-v0.1"
}

resource "aws_secretsmanager_secret_version" "app_env_version" {
  secret_id = aws_secretsmanager_secret.app_env.id
  secret_string = local.env_content
}

output "app_secret_name" {
  value = aws_secretsmanager_secret.app_env.name
}