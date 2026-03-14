import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * メールアドレス確認用のDTO。メールアドレス、確認コード、パスワードを検証する。
 */
export class VerifyEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}
