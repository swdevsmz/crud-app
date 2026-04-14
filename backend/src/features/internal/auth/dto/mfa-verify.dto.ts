import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * MFAコード検証用DTO。メールアドレス、セッション、コードを検証する。
 */
export class MfaVerifyDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    session!: string;

    @IsString()
    @IsNotEmpty()
    code!: string;
}
