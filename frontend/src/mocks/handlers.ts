import { http, HttpResponse } from 'msw';

const apiBaseUrl = 'http://localhost:3000';

export const handlers = [
    http.post(`${ apiBaseUrl }/auth/signin`, async ({ request }) => {
        const body = (await request.json()) as { email?: string; password?: string };

        if (!body.email || !body.password) {
            return HttpResponse.json({ message: 'Invalid sign-in payload.' }, { status: 400 });
        }

        // mfa- で始まるメールアドレスの場合は MFA チャレンジを返す
        if (body.email.startsWith('mfa-')) {
            return HttpResponse.json(
                {
                    message: 'MFA challenge required.',
                    mfaChallenge: {
                        session: 'mock-session-token',
                        challengeName: 'EMAIL_OTP'
                    }
                },
                { status: 200 }
            );
        }

        return HttpResponse.json(
            {
                message: 'Signin successful.',
                tokens: {
                    accessToken: 'mock-access-token',
                    idToken: 'mock-id-token',
                    refreshToken: 'mock-refresh-token',
                    expiresIn: 3600
                }
            },
            { status: 200 }
        );
    }),

    http.post(`${ apiBaseUrl }/auth/signup`, async () => {
        return HttpResponse.json(
            {
                message: 'Signup successful. Please check your email for verification.',
                requiresVerification: true
            },
            { status: 201 }
        );
    }),
    http.get(`${ apiBaseUrl }/auth/verify`, async ({ request }) => {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        const code = url.searchParams.get('code');
        const password = url.searchParams.get('password');

        if (!email || !code || !password) {
            return HttpResponse.json({ message: 'Invalid verification request.' }, { status: 400 });
        }

        // mfa- で始まるメールアドレスの場合は MFA チャレンジを返す
        if (email.startsWith('mfa-')) {
            return HttpResponse.json(
                {
                    message: 'Email verified. MFA setup required.',
                    verified: true,
                    requiresMfaSetup: true,
                    mfaChallenge: {
                        session: 'mock-session-token',
                        challengeName: 'EMAIL_OTP'
                    }
                },
                { status: 200 }
            );
        }

        return HttpResponse.json(
            {
                message: 'Email verified successfully.',
                verified: true,
                tokens: {
                    accessToken: 'mock-access-token',
                    idToken: 'mock-id-token',
                    refreshToken: 'mock-refresh-token',
                    expiresIn: 3600
                }
            },
            { status: 200 }
        );
    }),

    // MFA チャレンジ応答エンドポイント
    http.post(`${ apiBaseUrl }/auth/mfa/verify`, async ({ request }) => {
        const body = (await request.json()) as { email?: string; session?: string; code?: string };

        if (!body.email || !body.session || !body.code) {
            return HttpResponse.json({ message: 'Invalid MFA verification request.' }, { status: 400 });
        }

        // コードが 000000 の場合はエラーを返す
        if (body.code === '000000') {
            return HttpResponse.json({ message: 'Invalid OTP code.' }, { status: 400 });
        }

        return HttpResponse.json(
            {
                message: 'MFA challenge verified successfully.',
                tokens: {
                    accessToken: 'mock-access-token',
                    idToken: 'mock-id-token',
                    refreshToken: 'mock-refresh-token',
                    expiresIn: 3600
                },
                recoveryCodes: ['a1b2c3d4e5f6', 'b2c3d4e5f6a1', 'c3d4e5f6a1b2', 'd4e5f6a1b2c3', 'e5f6a1b2c3d4']
            },
            { status: 200 }
        );
    }),

    // MFA セットアップエンドポイント
    http.post(`${ apiBaseUrl }/auth/mfa/setup`, async ({ request }) => {
        const body = (await request.json()) as { email?: string; accessToken?: string };

        if (!body.email || !body.accessToken) {
            return HttpResponse.json({ message: 'Invalid MFA setup request.' }, { status: 400 });
        }

        return HttpResponse.json(
            {
                message: 'MFA setup successful.',
                recoveryCodes: ['f6a1b2c3d4e5', 'a1b2c3d4e5f6', 'b2c3d4e5f6a1', 'c3d4e5f6a1b2', 'd4e5f6a1b2c3']
            },
            { status: 200 }
        );
    })
];