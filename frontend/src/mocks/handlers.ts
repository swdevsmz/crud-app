import { http, HttpResponse } from 'msw';

const apiBaseUrl = 'http://localhost:3000';

export const handlers = [
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
    })
];