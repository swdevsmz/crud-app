import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CognitoService } from './cognito.service';
import { type AuthResponse, type AuthTokens } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly prisma = new PrismaClient();

  constructor(private readonly cognitoService: CognitoService) {
    this.logger.log('AuthService initialized');
  }

  /**
   *  ユーザー登録処理。Cognitoにサインアップリクエストを送信し、成功した場合は検証メールが送信されたことを示すレスポンスを返す。
   * @param payload  ユーザー登録のためのDTO。メールアドレスとパスワードを含む。
   * @returns  ユーザー登録の結果を示すAuthResponseオブジェクト。
   */
  async signup(payload: SignupDto): Promise<AuthResponse> {
    this.logger.log(`Signup requested for email=${ payload.email }`);
    try {
      await this.cognitoService.signUp(payload.email, payload.password);
      this.logger.log(`Cognito signup success for email=${ payload.email }`);
      return {
        message: 'Signup successful. Please check your email for verification.',
        requiresVerification: true
      };
    } catch (error: unknown) {
      this.logger.error(`Cognito signup error for email=${ payload.email }`, error as Error);
      throw this.mapCognitoError(error);
    }
  }

  /**
   * メールアドレス確認処理。Cognitoに確認コードを送信し、成功した場合はユーザー情報をデータベースに保存する。
   * MFAが必要な場合はチャレンジ情報を返す。
   * @param payload  メールアドレス確認のためのDTO。メールアドレス、確認コード、パスワードを含む。
   * @returns  メールアドレス確認の結果を示すAuthResponseオブジェクト。
   */
  async verifyEmail(payload: VerifyEmailDto): Promise<AuthResponse> {
    this.logger.log(`VerifyEmail requested for email=${ payload.email }`);
    try {

      await this.cognitoService.confirmSignUp(payload.email, payload.code);
      this.logger.log(`Cognito confirmSignUp success for email=${ payload.email }`);

      const authResult = await this.cognitoService.initiateAuth(payload.email, payload.password);

      // MFA チャレンジが返された場合は、チャレンジ情報を返す
      if (authResult.ChallengeName === 'EMAIL_OTP') {
        this.logger.log(`MFA challenge returned for email=${ payload.email }`);
        return {
          message: 'Email verified. MFA setup required.',
          verified: true,
          requiresMfaSetup: true,
          mfaChallenge: {
            session: authResult.Session || '',
            challengeName: authResult.ChallengeName
          }
        };
      }

      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      await this.upsertUser(payload.email, tokens.idToken);

      return {
        message: 'Email verified successfully.',
        verified: true,
        tokens
      };

    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * サインイン処理。Cognitoで認証し、必要なトークンを返す。
   * MFA チャレンジが返された場合はチャレンジ情報を返す。
   * MFA が設定されていない場合は強制セットアップフラグを返す。
   * @param payload サインインのためのDTO。メールアドレスとパスワードを含む。
   * @returns サインイン結果を示すAuthResponseオブジェクト。
   */
  async signin(payload: SigninDto): Promise<AuthResponse> {
    this.logger.log(`Signin requested for email=${ payload.email }`);
    try {
      const authResult = await this.cognitoService.initiateAuth(payload.email, payload.password);

      // MFA チャレンジが返された場合は、チャレンジ情報を返す
      if (authResult.ChallengeName === 'EMAIL_OTP') {
        this.logger.log(`MFA challenge returned for email=${ payload.email }`);
        return {
          message: 'MFA challenge required.',
          mfaChallenge: {
            session: authResult.Session || '',
            challengeName: authResult.ChallengeName
          }
        };
      }

      const tokens = this.toAuthTokens(authResult.AuthenticationResult);

      // MFA が設定されていないかどうかを確認
      const mfaConfig = await this.cognitoService.getUserMfaConfig(tokens.accessToken);
      const hasEmailMfa = mfaConfig.UserMFASettingList?.includes('EMAIL_MFA') ?? false;

      if (!hasEmailMfa) {
        this.logger.log(`MFA not configured for email=${ payload.email }. Requiring setup.`);
        // トークンは付与するが、セットアップが必要というフラグを立てる
        await this.upsertUser(payload.email, tokens.idToken);
        return {
          message: 'Signin successful. MFA setup required.',
          requiresMfaSetup: true,
          tokens
        };
      }

      await this.upsertUser(payload.email, tokens.idToken);

      return {
        message: 'Signin successful.',
        tokens
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   *  Cognitoの認証結果からAuthTokensオブジェクトを作成する。アクセストークン、IDトークン、リフレッシュトークン、トークンの有効期限を含む。
   * @param authenticationResult  Cognitoの認証結果オブジェクト。
   * @returns  AuthTokensオブジェクト。
   */
  private toAuthTokens(authenticationResult: unknown): AuthTokens {

    if (!authenticationResult || typeof authenticationResult !== 'object') {
      // Cognitoの認証結果が予期しない形式の場合はエラーをスローする
      throw new InternalServerErrorException('Authentication result is missing.');
    }

    // Cognitoの認証結果から必要なトークンを抽出する。アクセストークン、IDトークン、リフレッシュトークン、有効期限を含む。
    const result = authenticationResult as {
      AccessToken?: string;
      IdToken?: string;
      RefreshToken?: string;
      ExpiresIn?: number;
    };

    if (!result.AccessToken || !result.IdToken) {
      // Cognitoの認証結果に必要なトークンが含まれていない場合はエラーをスローする
      throw new InternalServerErrorException('Authentication tokens are missing.');
    }

    return {
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresIn: result.ExpiresIn
    };
  }

  /**
   * IDトークンからCognitoのサブ（ユーザー識別子）を抽出する。
   * @param idToken  IDトークン文字列。
   * @returns  Cognitoのサブ（ユーザー識別子）。
   */
  private extractSubFromIdToken(idToken: string): string {
    const jwtParts = idToken.split('.');
    if (jwtParts.length < 2) {

      throw new InternalServerErrorException('Invalid ID token format.');
    }

    const payload = jwtParts[1]
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(jwtParts[1].length / 4) * 4, '=');

    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedPayload) as { sub?: string };

    if (!parsed.sub) {
      // IDトークンにCognitoのサブ（ユーザー識別子）が含まれていない場合はエラーをスローする
      throw new InternalServerErrorException('Cognito subject was not found in ID token.');
    }

    return parsed.sub;
  }

  /**
   * IDトークンからsubを抽出し、ローカルDBのユーザー情報へ反映する。
   * @param email ユーザーのメールアドレス。
   * @param idToken CognitoのIDトークン。
   */
  private async upsertUser(email: string, idToken: string): Promise<void> {
    const cognitoSub = this.extractSubFromIdToken(idToken);

    await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        cognitoSub
      },
      update: {
        cognitoSub
      }
    });
  }

  /**
   * MFA チャレンジに応答。ユーザーが入力した OTP コードを検証し、トークンを返す。
   * @param email ユーザーのメールアドレス
   * @param session Cognito が返した session トークン
   * @param code ユーザーが入力した OTP コード
   * @returns 認証完了後の AuthResponse
   */
  async verifyMfaChallenge(email: string, session: string, code: string): Promise<AuthResponse> {
    this.logger.log(`MFA challenge response for email=${ email }`);
    try {
      const authResult = await this.cognitoService.respondToMfaChallenge(email, session, code);
      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      await this.upsertUser(email, tokens.idToken);

      // リカバリーコードを生成して保存する
      const recoveryCodes = await this.generateAndStoreRecoveryCodes(email);

      return {
        message: 'MFA challenge verified successfully.',
        tokens,
        recoveryCodes
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * MFA セットアップ。アクセストークンを使用して、ユーザーの MFA を有効にし、リカバリーコードを返す。
   * @param accessToken アクセストークン
   * @param email ユーザーのメールアドレス
   * @returns リカバリーコードを含む AuthResponse
   */
  async setupMfa(accessToken: string, email: string): Promise<AuthResponse> {
    this.logger.log(`MFA setup for email=${ email }`);
    try {
      // メール MFA を有効にする
      await this.cognitoService.setEmailMfaPreference(accessToken);
      this.logger.log(`Email MFA preference set for email=${ email }`);

      // リカバリーコードを生成して保存する
      const recoveryCodes = await this.generateAndStoreRecoveryCodes(email);

      return {
        message: 'MFA setup successful.',
        recoveryCodes
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * リカバリーコードを生成して、データベースに保存する。
   * @param email ユーザーのメールアドレス
   * @returns 平文のリカバリーコード配列
   */
  private async generateAndStoreRecoveryCodes(email: string): Promise<string[]> {
    this.logger.log(`Generating recovery codes for email=${ email }`);

    // ユーザー情報を取得
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new InternalServerErrorException('User not found.');
    }

    // 既存のリカバリーコードを削除
    await this.prisma.recoveryCode.deleteMany({
      where: { userId: user.id }
    });

    // 5 個のリカバリーコードを生成
    const plainCodes: string[] = [];
    for (let i = 0; i < 5; i++) {
      const code = randomBytes(6).toString('hex');
      plainCodes.push(code);

      // ハッシュ化して保存
      const codeHash = createHash('sha256').update(code).digest('hex');
      await this.prisma.recoveryCode.create({
        data: {
          userId: user.id,
          codeHash
        }
      });
    }

    this.logger.log(`Recovery codes generated for email=${ email }`);
    return plainCodes;
  }

  /**
   * Cognitoからのエラーを適切なNestJSのHTTP例外にマッピングする。Cognitoのエラー名に基づいて、ConflictException、BadRequestException、InternalServerErrorExceptionなどを返す。
   * @param error  Cognitoからのエラーオブジェクト。
   * @returns  NestJSのHTTP例外オブジェクト。
   */
  private mapCognitoError(error: unknown): Error {
    if (!error || typeof error !== 'object') {
      // Cognitoからのエラーが予期しない形式の場合は一般的な内部サーバーエラーを返す
      return new InternalServerErrorException('Unknown authentication error.');
    }

    const cognitoError = error as { name?: string; message?: string };

    switch (cognitoError.name) {
      case 'UsernameExistsException':
        // すでに同じメールアドレスのアカウントが存在する場合はConflictExceptionを返す
        return new ConflictException('An account with this email already exists.');
      case 'CodeMismatchException':
        // 確認コードが無効な場合はBadRequestExceptionを返す
        return new BadRequestException('Invalid verification code.');
      case 'ExpiredCodeException':
        // 確認コードが期限切れの場合はBadRequestExceptionを返す
        return new BadRequestException('Verification code has expired.');
      case 'NotAuthorizedException':
        // 認証に失敗した場合はBadRequestExceptionを返す
        return new BadRequestException('Invalid email or password.');
      case 'InvalidPasswordException':
      case 'InvalidParameterException':
      case 'UserNotFoundException':
        // 入力が無効な場合やユーザーが見つからない場合はBadRequestExceptionを返す
        return new BadRequestException(cognitoError.message ?? 'Invalid signup input.');
      default:
        return new InternalServerErrorException(cognitoError.message ?? 'Authentication service error.');
    }
  }
}
