import {
  AuthFlowType,
  ConfirmSignUpCommand,
  type ConfirmSignUpCommandOutput,
  CognitoIdentityProviderClient,
  GetUserCommand,
  type GetUserCommandOutput,
  InitiateAuthCommand,
  type InitiateAuthCommandOutput,
  RespondToAuthChallengeCommand,
  type RespondToAuthChallengeCommandOutput,
  SetUserMFAPreferenceCommand,
  SignUpCommand,
  type SignUpCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoService {
  private readonly logger = new Logger(CognitoService.name);
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
    this.logger.log(`CognitoService.signUp email=${ email }`);
    const result = await this.client.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }]
      })
    );
    this.logger.log(`Cognito signin request completed for email=${ email }`);
    return result;
  }

  /**
   * メールアドレス確認処理。Cognitoに確認コードを送信する。
   * @param email ユーザーのメールアドレス
   * @param code 確認コード
   * @returns Cognitoの確認サインアップコマンドの出力
   */
  async confirmSignUp(email: string, code: string): Promise<ConfirmSignUpCommandOutput> {
    this.logger.log(`CognitoService.confirmSignUp email=${ email } code=${ code }`);
    const result = await this.client.send(
      new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code
      })
    );
    this.logger.log(`Cognito confirmSignUp completed for email=${ email }`);
    return result;
  }

  /**
   * 認証処理。Cognitoに認証リクエストを送信する。
   * @param email ユーザーのメールアドレス
   * @param password ユーザーのパスワード
   * @returns Cognitoの認証コマンドの出力
   */
  async initiateAuth(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    this.logger.log(`CognitoService.initiateAuth email=${ email }`);
    const result = await this.client.send(
      new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      })
    );
    this.logger.log(`Cognito initiateAuth completed for email=${ email }`);
    return result;
  }

  /**
   * MFA チャレンジに応答。ユーザーが入力した OTP コードを Cognito に送信する。
   * @param email ユーザーのメールアドレス
   * @param session Cognito が返した session トークン
   * @param code ユーザーが入力した OTP コード
   * @returns Cognito の チャレンジ応答コマンドの出力
   */
  async respondToMfaChallenge(
    email: string,
    session: string,
    code: string
  ): Promise<RespondToAuthChallengeCommandOutput> {
    this.logger.log(`CognitoService.respondToMfaChallenge email=${ email }`);
    const result = await this.client.send(
      new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: 'EMAIL_OTP',
        Session: session,
        ChallengeResponses: {
          USERNAME: email,
          EMAIL_OTP_CODE: code
        }
      })
    );
    this.logger.log(`Cognito respondToMfaChallenge completed for email=${ email }`);
    return result;
  }

  /**
   * ユーザーの MFA 設定を取得。メール OTP が有効かどうかを確認する。
   * @param accessToken アクセストークン
   * @returns ユーザーの MFA 設定情報
   */
  async getUserMfaConfig(accessToken: string): Promise<GetUserCommandOutput> {
    this.logger.log('CognitoService.getUserMfaConfig');
    const result = await this.client.send(
      new GetUserCommand({
        AccessToken: accessToken
      })
    );
    return result;
  }

  /**
   * ユーザーの MFA 設定を更新。メール OTP を有効にする。
   * @param accessToken アクセストークン
   * @returns Cognito の MFA 設定更新コマンドの出力
   */
  async setEmailMfaPreference(accessToken: string) {
    this.logger.log('CognitoService.setEmailMfaPreference');
    const result = await this.client.send(
      new SetUserMFAPreferenceCommand({
        AccessToken: accessToken,
        EmailMfaSettings: {
          Enabled: true,
          PreferredMfa: true
        }
      })
    );
    return result;
  }
}
