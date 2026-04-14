resource "aws_iam_role" "cognito_sms" {
  # Cognito が SNS 経由で SMS を送信するための IAM ロール
  # SMS（携帯電話のテキストメッセージ）送信に SNS を使用
  # メール送信は SES を使う（user-pool.tf 参照）
  name = "${var.project_name}-${var.environment}-cognito-sms-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cognito-idp.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          # ExternalIdでなりすましを防止
          "sts:ExternalId" = "${var.project_name}-${var.environment}-sms-external"
        }
      }
    }]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy" "cognito_sms" {
  # SNS Publishのみを許可する最小権限ポリシー
  name = "${var.project_name}-${var.environment}-cognito-sms-policy"
  role = aws_iam_role.cognito_sms.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = "*"
    }]
  })
}
