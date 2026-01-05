# Generate a new SSH key pair in Terraform
resource "tls_private_key" "driver_service_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# Create an AWS key pair using the generated public key
resource "aws_key_pair" "driver_service" {
  key_name   = "driver_service_key"
  public_key = tls_private_key.driver_service_key.public_key_openssh
}

# EC2 instance
resource "aws_instance" "driver_service" {
  ami           = "ami-0b8d527345fdace59"
  instance_type = "t3.small"
  key_name      = aws_key_pair.driver_service.key_name
  iam_instance_profile = var.iam_instance_profile_name
  user_data     = file("${path.module}/user_data_api.sh")

  tags = {
    Name = "api-server"
  }
}

# Save the private key to a local .pem file
resource "local_file" "private_key_pem" {
  content  = tls_private_key.driver_service_key.private_key_pem
  filename = "${path.module}/driver_service.pem"
  file_permission = "0600"
}

# Outputs
output "driver_service_ip" {
  value = aws_instance.driver_service.public_ip
}

output "driver_service_pem_path" {
  value = local_file.private_key_pem.filename
}

output "driver_service_instance_id" {
  value = aws_instance.driver_service.id
}

# Variables
variable "iam_instance_profile_name" {
  type = string
}