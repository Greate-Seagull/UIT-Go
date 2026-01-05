resource "aws_s3_bucket" "compose_bucket" {
  bucket = "driver-compose-bucket"
}

output "compose_bucket_name" {
  value = aws_s3_bucket.compose_bucket.bucket
}