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

import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthService } from './auth.service';
import { type AuthResponse } from './interfaces/auth-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

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
}
