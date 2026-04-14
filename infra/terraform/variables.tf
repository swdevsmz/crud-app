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
  default     = ["http://localhost:3000/verify"]
}

# Cognito App Clientで許可するログアウト遷移先URL
variable "logout_urls" {
  description = "Allowed OAuth logout URLs for app client"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

# Email MFA を Cognito のデフォルト送信ではなく SES で送るための設定
variable "ses_source_arn" {
  description = "SES identity ARN used by Cognito email delivery"
  type        = string
  default     = null

  validation {
    condition = (
      var.ses_source_arn == null &&
      var.from_email_address == null &&
      var.reply_to_email_address == null
    ) || (
      var.ses_source_arn != null &&
      var.from_email_address != null &&
      var.reply_to_email_address != null
    )
    error_message = "Set ses_source_arn, from_email_address, and reply_to_email_address together for Cognito email MFA."
  }
}

variable "from_email_address" {
  description = "From email address for Cognito emails when SES is configured"
  type        = string
  default     = null
}

variable "reply_to_email_address" {
  description = "Reply-To email address for Cognito emails when SES is configured"
  type        = string
  default     = null
}
