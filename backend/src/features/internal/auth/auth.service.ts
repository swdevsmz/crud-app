import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { MfaVerifyDto } from './dto/mfa-verify.dto';
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
      await this.cognitoService.signUp(payload.email, payload.password, payload.phoneNumber);
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
   * @param payload  メールアドレス確認のためのDTO。メールアドレス、確認コード、パスワードを含む。
   * @returns  メールアドレス確認の結果を示すAuthResponseオブジェクト。
   */
  async verifyEmail(payload: VerifyEmailDto): Promise<AuthResponse> {
    this.logger.log(`VerifyEmail requested for email=${ payload.email }`);
    try {

      await this.cognitoService.confirmSignUp(payload.email, payload.code);
      this.logger.log(`Cognito confirmSignUp success for email=${ payload.email }`);

      const authResult = await this.cognitoService.initiateAuth(payload.email, payload.password);

      // MFAチャレンジが必要な場合はセッションを返す
      if (authResult.ChallengeName === 'EMAIL_OTP') {
        this.logger.log(`MFA challenge required for email=${ payload.email }`);
        return {
          message: 'Email verified. Please enter the MFA code sent to your email.',
          mfaRequired: true,
          session: authResult.Session,
          email: payload.email
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
   * サインイン処理。メールアドレスとパスワードでCognitoに認証リクエストを送信する。MFAが有効な場合はチャレンジ情報を返す。
   * @param payload サインイン用DTO
   * @returns 認証結果またはMFAチャレンジ情報
   */
  async signIn(payload: SigninDto): Promise<AuthResponse> {
    this.logger.log(`SignIn requested for email=${ payload.email }`);
    try {
      const authResult = await this.cognitoService.initiateAuth(payload.email, payload.password);

      // MFAチャレンジが必要な場合はセッションを返す
      if (authResult.ChallengeName === 'EMAIL_OTP') {
        this.logger.log(`MFA challenge required for email=${ payload.email }`);
        return {
          message: 'MFA code sent to your email.',
          mfaRequired: true,
          session: authResult.Session,
          email: payload.email
        };
      }

      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      await this.upsertUser(payload.email, tokens.idToken);

      return {
        message: 'Sign-in successful.',
        tokens
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * MFAコード検証処理。メールで受信したOTPコードをCognitoに送信してトークンを取得する。
   * @param payload MFA検証用DTO
   * @returns 認証トークン
   */
  async verifyMfa(payload: MfaVerifyDto): Promise<AuthResponse> {
    this.logger.log(`MFA verify requested for email=${ payload.email }`);
    try {
      const authResult = await this.cognitoService.respondToEmailOtp(
        payload.email,
        payload.session,
        payload.code
      );

      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      await this.upsertUser(payload.email, tokens.idToken);

      return {
        message: 'MFA verification successful.',
        tokens
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * グローバルサインアウト処理。Cognitoのすべてのデバイスのトークンを無効化する。
   * @param accessToken 有効なアクセストークン
   * @returns サインアウト結果
   */
  async signOut(accessToken: string): Promise<AuthResponse> {
    this.logger.log('SignOut requested');
    try {
      await this.cognitoService.globalSignOut(accessToken);
      return { message: 'Sign-out successful.' };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * リフレッシュトークンを使用して新しいアクセストークンとIDトークンを発行する。
   * @param refreshToken リフレッシュトークン
   * @returns 新しい認証トークン（リフレッシュトークンは元のものを維持）
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    this.logger.log('RefreshTokens requested');
    try {
      const authResult = await this.cognitoService.refreshToken(refreshToken);
      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      // リフレッシュフローでは新しいリフレッシュトークンは返却されないため元のものを維持
      return {
        message: 'Token refreshed.',
        tokens: { ...tokens, refreshToken }
      };
    } catch (error: unknown) {
      throw this.mapCognitoError(error);
    }
  }

  /**
   * ユーザー情報をデータベースにupsertする。
   * @param email ユーザーのメールアドレス
   * @param idToken IDトークン
   */
  private async upsertUser(email: string, idToken: string): Promise<void> {
    const cognitoSub = this.extractSubFromIdToken(idToken);
    await this.prisma.user.upsert({
      where: { email },
      create: { email, cognitoSub },
      update: { cognitoSub }
    });
    this.logger.log(`User upserted for email=${ email }`);
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
      case 'EnableSoftwareTokenMFAException':
      case 'MFAMethodNotFoundException':
        // MFA設定エラー
        return new BadRequestException('MFA configuration error.');
      default:
        return new InternalServerErrorException(cognitoError.message ?? 'Authentication service error.');
    }
  }
}
