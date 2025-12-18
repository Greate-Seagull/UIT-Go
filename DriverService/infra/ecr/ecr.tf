resource "aws_ecr_repository" "this" {
    name = "driver-repo"
    image_tag_mutability = "MUTABLE"
}

# Outputs
output "ecr_repo_uri" {
    value = aws_ecr_repository.this.repository_url
}