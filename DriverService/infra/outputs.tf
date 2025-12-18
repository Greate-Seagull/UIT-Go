output "ecr_repo_uri" {
  value = module.ecr.ecr_repo_uri
}

output "image_name" {
  value = "server-driver-service"
}

output "driver_service_ip" {
  value = module.ec2.driver_service_ip
}

output "driver_service_pem_path" {
  value = module.ec2.driver_service_pem_path
}

output "driver_service_instance_id" {
  value = module.ec2.driver_service_instance_id
}

output "compose_bucket_name" {
  value = module.s3.compose_bucket_name
}

output "app_secret_name" {
  value = module.sm.app_secret_name
}