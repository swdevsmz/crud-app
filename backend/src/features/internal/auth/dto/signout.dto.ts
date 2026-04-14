import { IsNotEmpty, IsString } from 'class-validator';

/**
 * サインアウト用DTO。グローバルサインアウトに必要なアクセストークンを検証する。
 */
export class SignoutDto {
    @IsString()
    @IsNotEmpty()
    accessToken!: string;
}
