import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { HealthModule } from './features/internal/app/health/health.module';
import { AuthModule } from './features/internal/auth/auth.module';

// アプリケーションのルートモジュール。全機能モジュールをまとめる
@Module({
  imports: [AuthModule, HealthModule]
})
class AppModule { }

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // 開発環境ではすべてのオリジンからのリクエストを許可
  app.enableCors();
  // リクエストボディのバリデーションを全エンドポイントに適用
  // whitelist: DTOに定義されていないフィールドを自動除去
  // transform: リクエストボディをDTOクラスのインスタンスへ変換
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
