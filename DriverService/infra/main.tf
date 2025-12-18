terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.20.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = "ap-southeast-2"
}

# Include modules or subfolders
module "iam" {
  source = "./iam"
}

module "sm" {
  source = "./sm"
}

module "ecr" {
  source = "./ecr"
}

module "s3" {
  source = "./s3"
}

# module "vpc" {
#   source = "./vpc"
# }

module "ecache" {
  source = "./ecache"
}

module "ec2" {
  source                    = "./ec2"
  iam_instance_profile_name = module.iam.ec2_profile_name
}
