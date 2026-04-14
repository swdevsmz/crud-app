import { IsNotEmpty, IsString } from 'class-validator';

/**
 * トークンリフレッシュ用DTO。リフレッシュトークンを検証する。
 */
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}
