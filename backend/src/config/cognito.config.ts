import { registerAs } from '@nestjs/config';

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  endpoint?: string;
}

export default registerAs('cognito', (): CognitoConfig => ({
  region: process.env.AWS_REGION ?? 'ap-northeast-1',
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
  clientId: process.env.COGNITO_CLIENT_ID ?? '',
  endpoint: process.env.COGNITO_ENDPOINT ?? process.env.LOCALSTACK_ENDPOINT
}));
