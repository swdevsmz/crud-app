import { registerAs } from '@nestjs/config';

// Cognito接続に必要な設定値の型定義
export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  /** LocalStack などローカル開発用エンドポイント（本番では不要） */
  endpoint?: string;
}

// 'cognito' というキーでNestJSの設定モジュールに登録する
// 各値は環境変数から取得し、未設定の場合はデフォルト値を使用する
export default registerAs('cognito', (): CognitoConfig => ({
  region: process.env.AWS_REGION ?? 'ap-northeast-1',
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
  clientId: process.env.COGNITO_CLIENT_ID ?? '',
  // COGNITO_ENDPOINT が未設定の場合は LOCALSTACK_ENDPOINT にフォールバック
  endpoint: process.env.COGNITO_ENDPOINT ?? process.env.LOCALSTACK_ENDPOINT
}));
