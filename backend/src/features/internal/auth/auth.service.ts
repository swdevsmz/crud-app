import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
   * @param payload  メールアドレス確認のためのDTO。メールアドレス、確認コード、パスワードを含む。
   * @returns  メールアドレス確認の結果を示すAuthResponseオブジェクト。
   */
  async verifyEmail(payload: VerifyEmailDto): Promise<AuthResponse> {
    this.logger.log(`VerifyEmail requested for email=${ payload.email }`);
    try {

      await this.cognitoService.confirmSignUp(payload.email, payload.code);
      this.logger.log(`Cognito confirmSignUp success for email=${ payload.email }`);

      const authResult = await this.cognitoService.initiateAuth(payload.email, payload.password);
      const tokens = this.toAuthTokens(authResult.AuthenticationResult);
      const cognitoSub = this.extractSubFromIdToken(tokens.idToken);

      await this.prisma.user.upsert({
        where: { email: payload.email },
        create: {
          email: payload.email,
          cognitoSub
        },
        update: {
          cognitoSub
        }
      });

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
      default:
        return new InternalServerErrorException(cognitoError.message ?? 'Authentication service error.');
    }
  }
}
