import {
  AuthFlowType,
  ConfirmSignUpCommand,
  type ConfirmSignUpCommandOutput,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  type InitiateAuthCommandOutput,
  SignUpCommand,
  type SignUpCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoService {
  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('cognito.clientId', '');
    this.client = new CognitoIdentityProviderClient({
      region: this.configService.get<string>('cognito.region', 'ap-northeast-1'),
      endpoint: this.configService.get<string>('cognito.endpoint')
    });
  }

  /**
   * ユーザー登録処理。Cognitoにサインアップリクエストを送信する。
   * @param email ユーザーのメールアドレス
   * @param password ユーザーのパスワード
   * @returns Cognitoのサインアップコマンドの出力
   */
  async signUp(email: string, password: string): Promise<SignUpCommandOutput> {
    return this.client.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }]
      })
    );
  }

  /**
   * メールアドレス確認処理。Cognitoに確認コードを送信する。
   * @param email ユーザーのメールアドレス
   * @param code 確認コード
   * @returns Cognitoの確認サインアップコマンドの出力
   */
  async confirmSignUp(email: string, code: string): Promise<ConfirmSignUpCommandOutput> {
    return this.client.send(
      new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code
      })
    );
  }

  /**
   * 認証処理。Cognitoに認証リクエストを送信する。
   * @param email ユーザーのメールアドレス
   * @param password ユーザーのパスワード
   * @returns Cognitoの認証コマンドの出力
   */
  async initiateAuth(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    return this.client.send(
      new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      })
    );
  }
}
