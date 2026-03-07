import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule]
})
class AppModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
