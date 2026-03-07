#!/usr/bin/env bash
set -euo pipefail

endpoint="${LOCALSTACK_ENDPOINT:-http://localhost:4566}"
region="${AWS_REGION:-ap-northeast-1}"

create_pool_output=$(aws cognito-idp create-user-pool \
  --endpoint-url "$endpoint" \
  --region "$region" \
  --pool-name "crud-app-local-user-pool" \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true}}')

user_pool_id=$(printf '%s' "$create_pool_output" | grep -o '"Id": "[^"]*"' | head -1 | cut -d '"' -f4)

create_client_output=$(aws cognito-idp create-user-pool-client \
  --endpoint-url "$endpoint" \
  --region "$region" \
  --user-pool-id "$user_pool_id" \
  --client-name "crud-app-local-client" \
  --generate-secret false)

client_id=$(printf '%s' "$create_client_output" | grep -o '"ClientId": "[^"]*"' | head -1 | cut -d '"' -f4)

cat <<EOT
Local Cognito setup complete.
COGNITO_USER_POOL_ID=$user_pool_id
COGNITO_CLIENT_ID=$client_id
EOT
