import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
/**
 * ユーザー登録用のDTO。メールアドレスとパスワードを検証する。
 */
export class SignupDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: 'password must include at least one uppercase letter' })
    @Matches(/[a-z]/, { message: 'password must include at least one lowercase letter' })
    @Matches(/\d/, { message: 'password must include at least one number' })
    @Matches(/[^A-Za-z0-9]/, { message: 'password must include at least one symbol' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'Phone number is required for account recovery' })
    @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format (e.g. +819012345678)' })
    phoneNumber!: string;
}
