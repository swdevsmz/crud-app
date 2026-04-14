import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * サインイン用DTO。メールアドレスとパスワードを検証する。
 */
export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}
