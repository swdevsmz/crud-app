import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import cognitoConfig from '../config/cognito.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoService } from './cognito.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [cognitoConfig] })],
  controllers: [AuthController],
  providers: [AuthService, CognitoService],
  exports: [AuthService, CognitoService]
})
export class AuthModule {}
