# バックエンド/フロントエンド設定に利用するUser Pool ID
output "cognito_user_pool_id" {
  description = "Created Cognito User Pool ID"
  value       = aws_cognito_user_pool.this.id
}

# IAMポリシー作成時などに参照するUser Pool ARN
output "cognito_user_pool_arn" {
  description = "Created Cognito User Pool ARN"
  value       = aws_cognito_user_pool.this.arn
}

# アプリ設定に利用するCognito App Client ID
output "cognito_user_pool_client_id" {
  description = "Created Cognito App Client ID"
  value       = aws_cognito_user_pool_client.native.id
}
