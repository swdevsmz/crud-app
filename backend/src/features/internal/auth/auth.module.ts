import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import cognitoConfig from '../../../common/config/cognito.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoService } from './cognito.service';

/**
 * 認証機能モジュール。
 * サインアップ・サインイン・MFA・トークン管理のエンドポイントを提供する。
 */
@Module({
  // isGlobal: true により ConfigModule を他のモジュールでも import 不要で使用できる
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [cognitoConfig] })],
  controllers: [AuthController],
  providers: [AuthService, CognitoService],
  // 他のモジュールからも AuthService/CognitoService を利用できるようにエクスポート
  exports: [AuthService, CognitoService]
})
export class AuthModule { }
