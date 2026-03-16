terraform {
  # 利用するTerraform本体バージョン
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      # AWSリソース作成に使うプロバイダー
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  # 開発で利用するAWSリージョン
  region = var.aws_region
}
