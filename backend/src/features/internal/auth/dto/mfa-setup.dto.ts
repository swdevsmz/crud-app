import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * MFA セットアップのための DTO
 */
export class MfaSetupDto {
  /**
   * ユーザーのメールアドレス
   */
  @IsEmail()
  email!: string;

  /**
   * アクセストークン
   */
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
