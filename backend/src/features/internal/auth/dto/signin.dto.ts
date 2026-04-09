import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * サインイン用のDTO。メールアドレスとパスワードを検証する。
 */
export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}
