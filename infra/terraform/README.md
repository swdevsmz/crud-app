# Cognito Terraform (Development)

このディレクトリは、開発環境向けの AWS Cognito リソースを Terraform で作成します。

## 作成対象

- Cognito User Pool
- Cognito User Pool App Client
- Cognito の Email MFA / SMS recovery 用設定

## 前提条件

- Terraform 1.6+
- AWS CLI が設定済み
- 開発用AWSアカウントに作成権限があること

## 使い方

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

## 出力値

`terraform apply` 後に以下が出力されます。

- `cognito_user_pool_id`
- `cognito_user_pool_client_id`

これらを次の環境変数へ設定してください。

- backend: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- frontend: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`

## 削除

```bash
terraform destroy
```

## 注意

- Email MFA を有効にするため、User Pool は `ESSENTIALS` tier を使います。
- Email MFA には SES を使った独自メール送信設定が必要です。`terraform.tfvars` の `ses_source_arn` などを実環境値へ置き換えてください。
- 現在の AWS アカウント `321058214401` の `ap-northeast-1` では SES identity が未作成で、SES は sandbox 状態です。送信元 identity の検証が先に必要です。
- フロントの現在の確認画面ルートに合わせて、callback URL の例は `http://localhost:3000/verify` にしています。
