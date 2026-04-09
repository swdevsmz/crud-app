import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';

import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { MfaSetupDto } from './dto/mfa-setup.dto';
import { AuthService } from './auth.service';
import { type AuthResponse } from './interfaces/auth-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Create a user signup request' })
  @ApiCreatedResponse({ description: 'Signup request accepted. Verification email sent.' })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  @ApiBadRequestResponse({ description: 'Invalid signup payload.' })
  async signup(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: SignupDto
  ): Promise<AuthResponse> {
    return this.authService.signup(payload);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email and issue auth tokens' })
  @ApiQuery({ name: 'email', required: true })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'password', required: true })
  @ApiOkResponse({ description: 'Email verified and user authenticated.' })
  @ApiBadRequestResponse({ description: 'Invalid verification request.' })
  async verify(
    @Query(new ValidationPipe({ whitelist: true, transform: true })) query: VerifyEmailDto
  ): Promise<AuthResponse> {
    return this.authService.verifyEmail(query);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in and issue auth tokens' })
  @ApiOkResponse({ description: 'Signed in successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid sign-in payload.' })
  async signin(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: SigninDto
  ): Promise<AuthResponse> {
    return this.authService.signin(payload);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify MFA challenge and issue auth tokens' })
  @ApiOkResponse({ description: 'MFA challenge verified.' })
  @ApiBadRequestResponse({ description: 'Invalid MFA verification.' })
  async verifyMfa(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: MfaVerifyDto
  ): Promise<AuthResponse> {
    return this.authService.verifyMfaChallenge(payload.email, payload.session, payload.code);
  }

  @Post('mfa/setup')
  @ApiOperation({ summary: 'Setup MFA and generate recovery codes' })
  @ApiOkResponse({ description: 'MFA setup successful.' })
  @ApiBadRequestResponse({ description: 'Invalid MFA setup request.' })
  async setupMfa(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: MfaSetupDto
  ): Promise<AuthResponse> {
    return this.authService.setupMfa(payload.accessToken, payload.email);
  }
}
