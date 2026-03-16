resource "aws_cognito_user_pool_client" "native" {
  # フロントエンド（SPA）から利用するアプリクライアント
  name         = "${var.project_name}-${var.environment}-native-client"
  user_pool_id = aws_cognito_user_pool.this.id

  # SPAクライアントなのでシークレットは発行しない
  generate_secret = false

  explicit_auth_flows = [
    # ユーザーの通常ログインとリフレッシュトークン更新を許可
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # OAuth設定（認可コードフロー）
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  # ローカル開発時に許可するリダイレクトURL
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Cognito組み込みIDプロバイダーを利用
  supported_identity_providers = ["COGNITO"]

  # 存在しないユーザーへの応答を統一し、情報漏えいを抑制
  prevent_user_existence_errors = "ENABLED"

  # 各トークンの有効期限
  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    # トークンごとの有効期限単位
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}
