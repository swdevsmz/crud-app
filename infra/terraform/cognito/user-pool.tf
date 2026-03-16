resource "aws_cognito_user_pool" "this" {
  # サインアップで利用するCognitoユーザープール
  name = "${var.project_name}-${var.environment}-user-pool"

  # 学習フェーズではMFAを無効化
  mfa_configuration = "OFF"

  # メールアドレスを自動検証対象にする
  auto_verified_attributes = ["email"]

  # ユーザー名としてメールアドレスを利用
  username_attributes = ["email"]
  username_configuration {
    # メールアドレスの大文字小文字差異を吸収
    case_sensitive = false
  }

  password_policy {
    # 学習用MVPでも最低限の強度を担保する
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  verification_message_template {
    # メール検証はコードではなくリンク方式を使う
    default_email_option = "CONFIRM_WITH_LINK"
  }

  admin_create_user_config {
    # 管理者作成限定にせず、通常サインアップを許可
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      # パスワード再設定の回復手段は検証済みメールを優先
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    # 運用時の検索性を高める共通タグ
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
