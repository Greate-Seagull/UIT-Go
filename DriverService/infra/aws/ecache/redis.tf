resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "my-redis"
  description = "Redis cache for application"
  engine                        = "redis"
  engine_version                = "7.1"
  port                          = 6379
  node_type = "cache.t4g.micro"
}