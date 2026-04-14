import {
  AuthFlowType,
  ChallengeNameType,
  ConfirmSignUpCommand,
  type ConfirmSignUpCommandOutput,
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  type InitiateAuthCommandOutput,
  RespondToAuthChallengeCommand,
  type RespondToAuthChallengeCommandOutput,
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
   * @param phoneNumber アカウント復旧用の電話番号（E.164形式）
   * @returns Cognitoのサインアップコマンドの出力
   */
  async signUp(email: string, password: string, phoneNumber: string): Promise<SignUpCommandOutput> {
    this.logger.log(`CognitoService.signUp email=${ email }`);
    const result = await this.client.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'phone_number', Value: phoneNumber }
        ]
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
   * グローバルサインアウト処理。すべてのデバイスのトークンを無効化する。
   * @param accessToken 有効なアクセストークン
   */
  async globalSignOut(accessToken: string): Promise<void> {
    this.logger.log('CognitoService.globalSignOut');
    await this.client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    this.logger.log('Cognito globalSignOut completed');
  }

  /**
   * リフレッシュトークンを使用して新しいアクセストークンとIDトークンを取得する。
   * @param refreshToken リフレッシュトークン
   * @returns Cognitoの認証コマンドの出力（AccessToken, IdToken, ExpiresIn）
   */
  async refreshToken(refreshToken: string): Promise<InitiateAuthCommandOutput> {
    this.logger.log('CognitoService.refreshToken');
    const result = await this.client.send(
      new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      })
    );
    this.logger.log('Cognito refreshToken completed');
    return result;
  }

  /**
   * メールOTPチャレンジへの応答処理。MFAコードを送信してトークンを取得する。
   * @param email ユーザーのメールアドレス
   * @param session CognitoチャレンジセッショントークN
   * @param code メールで受信したOTPコード
   * @returns Cognitoのチャレンジ応答コマンドの出力
   */
  async respondToEmailOtp(
    email: string,
    session: string,
    code: string
  ): Promise<RespondToAuthChallengeCommandOutput> {
    this.logger.log(`CognitoService.respondToEmailOtp email=${ email }`);
    const result = await this.client.send(
      new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: ChallengeNameType.EMAIL_OTP,
        Session: session,
        ChallengeResponses: {
          EMAIL_OTP_CODE: code,
          USERNAME: email
        }
      })
    );
    this.logger.log(`Cognito respondToEmailOtp completed for email=${ email }`);
    return result;
  }
}
