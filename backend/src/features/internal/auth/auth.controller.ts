import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SigninDto } from './dto/signin.dto';
import { SignoutDto } from './dto/signout.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
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
  @ApiOperation({ summary: 'Verify email and issue auth tokens (or MFA challenge)' })
  @ApiQuery({ name: 'email', required: true })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'password', required: true })
  @ApiOkResponse({ description: 'Email verified. Returns tokens or MFA challenge.' })
  @ApiBadRequestResponse({ description: 'Invalid verification request.' })
  async verify(
    @Query(new ValidationPipe({ whitelist: true, transform: true })) query: VerifyEmailDto
  ): Promise<AuthResponse> {
    return this.authService.verifyEmail(query);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ description: 'Sign-in successful. Returns tokens or MFA challenge.' })
  @ApiBadRequestResponse({ description: 'Invalid email or password.' })
  async signin(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: SigninDto
  ): Promise<AuthResponse> {
    return this.authService.signIn(payload);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify MFA (email OTP) code and issue auth tokens' })
  @ApiOkResponse({ description: 'MFA verified and tokens issued.' })
  @ApiBadRequestResponse({ description: 'Invalid or expired MFA code.' })
  async mfaVerify(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: MfaVerifyDto
  ): Promise<AuthResponse> {
    return this.authService.verifyMfa(payload);
  }

  @Post('signout')
  @ApiOperation({ summary: 'Sign out and revoke all tokens globally (all devices)' })
  @ApiOkResponse({ description: 'Sign-out successful.' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired access token.' })
  async signout(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: SignoutDto
  ): Promise<AuthResponse> {
    return this.authService.signOut(payload.accessToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and ID tokens using a refresh token' })
  @ApiOkResponse({ description: 'Tokens refreshed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  async refresh(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) payload: RefreshTokenDto
  ): Promise<AuthResponse> {
    return this.authService.refreshTokens(payload.refreshToken);
  }
}
