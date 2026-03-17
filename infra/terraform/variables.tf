# Cognito作成先リージョン
variable "aws_region" {
  description = "AWS region for Cognito resources"
  type        = string
  default     = "ap-northeast-1"
}

# リソース命名に使うプロジェクト名
variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "crud-app"
}

# dev/stg/prod などの環境識別子
variable "environment" {
  description = "Environment name used for resource naming"
  type        = string
  default     = "dev"
}

# Cognito App Clientで許可するコールバックURL
variable "callback_urls" {
  description = "Allowed OAuth callback URLs for app client"
  type        = list(string)
  default     = ["http://localhost:3000/verify-email"]
}

# Cognito App Clientで許可するログアウト遷移先URL
variable "logout_urls" {
  description = "Allowed OAuth logout URLs for app client"
  type        = list(string)
  default     = ["http://localhost:3000"]
}
