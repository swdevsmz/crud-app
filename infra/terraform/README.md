# Cognito Terraform (Development)

このディレクトリは、開発環境向けの AWS Cognito リソースを Terraform で作成します。

## 作成対象

- Cognito User Pool
- Cognito User Pool App Client

## 前提条件

- Terraform 1.6+
- AWS CLI が設定済み
- 開発用AWSアカウントに作成権限があること

## 使い方

```bash
cd infra/terraform/cognito
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

- 学習用の最小構成です。
- 本番運用ではMFA、詳細なパスワードポリシー、メール送信設定、WAF等を追加してください。
