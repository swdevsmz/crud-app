resource "aws_cognito_user_pool" "this" {
  # サインアップで利用するCognitoユーザープール
  name = "${var.project_name}-${var.environment}-user-pool"

  # Email MFA は Essentials 以上でのみ利用可能
  user_pool_tier = "ESSENTIALS"

  # メールOTPによる2要素認証を有効化
  mfa_configuration = "ON"

  email_mfa_configuration {
    message = "認証コードは {####} です。"
    subject = "サインイン認証コード"
  }

  # Email 認証コード送信に SES を使用
  # - SES（Simple Email Service）: メール送信専用
  # - SNS（Simple Notification Service）: SMS 送信専用
  # 用途に応じて使い分けている
  dynamic "email_configuration" {
    for_each = var.ses_source_arn == null ? [] : [var.ses_source_arn]

    content {
      email_sending_account  = "DEVELOPER"
      source_arn             = email_configuration.value
      from_email_address     = var.from_email_address
      reply_to_email_address = var.reply_to_email_address
    }
  }

  # 自動検証はメールのみ（SMS依存を避ける）
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
    require_lowercase = false
    require_numbers   = true
    require_symbols   = true
    require_uppercase = false
  }

  verification_message_template {
    # 学習用の最小構成として、ドメイン不要のコード方式を使う
    default_email_option = "CONFIRM_WITH_CODE"
  }

  admin_create_user_config {
    # 管理者作成限定にせず、通常サインアップを許可
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      # 自己パスワード再設定は無効化し、管理者リセットのみ許可
      name     = "admin_only"
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
