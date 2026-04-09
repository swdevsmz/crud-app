import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * MFA チャレンジ応答のための DTO
 */
export class MfaVerifyDto {
  /**
   * ユーザーのメールアドレス
   */
  @IsEmail()
  email!: string;

  /**
   * Cognito が返した session トークン
   */
  @IsString()
  @IsNotEmpty()
  session!: string;

  /**
   * ユーザーが入力した 6 桁の OTP コード
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Code must be a 6-digit number'
  })
  code!: string;
}
