import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
