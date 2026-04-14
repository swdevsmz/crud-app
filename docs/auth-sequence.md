# Auth Sequence Diagram

現行実装に基づく認証フローのシーケンス図。

## Signup フロー

`/signup` → `/verify` → `/dashboard`（MFA有効時は `/mfa-verify` 経由）

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant SP as SignupPage
    participant VP as VerifyPage
    participant MV as MfaVerifyPage
    participant HK as useSignup hook
    participant FS as authService
    participant API as apiClient(axios)
    participant AC as AuthController
    participant AS as AuthService
    participant CS as CognitoService
    participant CG as AWS Cognito
    participant PR as Prisma Client
    participant DB as SQLite
    participant ST as authStateAtom(Jotai)

    Note over U,ST: Step 1 – 仮登録
    U->>SP: submit(email, password, phoneNumber)
    SP->>HK: signupMutation.mutateAsync(payload)
    HK->>FS: signup(payload)
    FS->>API: POST /auth/signup
    API->>AC: POST /auth/signup
    AC->>AS: signup(SignupDto)
    AS->>CS: signUp(email, password, phoneNumber)
    CS->>CG: SignUpCommand {email, phone_number}
    CG-->>CS: accepted
    CS-->>AS: SignUpCommandOutput
    AS-->>AC: {requiresVerification: true}
    AC-->>API: 201 AuthResponse
    API-->>FS: response.data
    FS-->>HK: AuthResponse
    HK-->>SP: mutation resolved
    SP->>VP: navigate /verify?email=... (location.state: signupSuccessMessage)

    Note over U,ST: Step 2 – メール確認 + 自動サインイン
    U->>VP: submit(email, code, password)
    VP->>HK: verifyEmailMutation.mutateAsync(payload)
    HK->>FS: verifyEmail(payload)
    FS->>API: GET /auth/verify?email&code&password
    API->>AC: GET /auth/verify
    AC->>AS: verifyEmail(VerifyEmailDto)
    AS->>CS: confirmSignUp(email, code)
    CS->>CG: ConfirmSignUpCommand
    CG-->>CS: confirmed
    AS->>CS: initiateAuth(email, password)
    CS->>CG: InitiateAuthCommand(USER_PASSWORD_AUTH)

    alt MFA無効（EMAIL_OTP チャレンジなし）
        CG-->>CS: AuthenticationResult {AccessToken, IdToken, RefreshToken}
        CS-->>AS: InitiateAuthCommandOutput
        AS->>AS: extractSubFromIdToken(idToken)
        AS->>PR: user.upsert(email, cognitoSub)
        PR->>DB: INSERT or UPDATE users
        DB-->>PR: ok
        AS-->>AC: {verified: true, tokens}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(tokens)
        HK->>ST: setAuthState({accessToken, idToken, refreshToken, expiresAt, isAuthenticated: true})
        HK-->>VP: success
        VP->>U: navigate /dashboard
    else MFA有効（EMAIL_OTP チャレンジあり）
        CG-->>CS: ChallengeName=EMAIL_OTP, Session
        CS-->>AS: InitiateAuthCommandOutput
        AS-->>AC: {mfaRequired: true, session, email}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(mfaRequired)
        HK-->>VP: mutation resolved (tokens未返却のためstate更新なし)
        VP->>MV: navigate /mfa-verify (location.state: {email, session})
        U->>MV: submit(code)
        MV->>HK: mfaVerifyMutation.mutateAsync({email, session, code})
        Note right of HK: useSignin フックの mfaVerifyMutation を使用
        HK->>FS: verifyMfa({email, session, code})
        FS->>API: POST /auth/mfa/verify
        API->>AC: POST /auth/mfa/verify
        AC->>AS: verifyMfa(MfaVerifyDto)
        AS->>CS: respondToEmailOtp(email, session, code)
        CS->>CG: RespondToAuthChallengeCommand(EMAIL_OTP)
        CG-->>CS: AuthenticationResult {AccessToken, IdToken, RefreshToken}
        CS-->>AS: RespondToAuthChallengeCommandOutput
        AS->>AS: extractSubFromIdToken(idToken)
        AS->>PR: user.upsert(email, cognitoSub)
        PR->>DB: INSERT or UPDATE users
        DB-->>PR: ok
        AS-->>AC: {tokens}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(tokens)
        MV->>ST: setAuthState({accessToken, idToken, refreshToken, expiresAt, isAuthenticated: true})
        MV->>U: navigate /dashboard
    end

    alt Cognito / バリデーションエラー
        CG-->>CS: error (UsernameExistsException など)
        CS-->>AS: throws
        AS->>AS: mapCognitoError(error) → NestJS HTTP例外
        AS-->>AC: 4xx / 500
        AC-->>API: error response
        API-->>FS: reject
        FS-->>HK: Error
        HK-->>SP: Error("登録に失敗しました。")
        HK-->>VP: Error("メール確認に失敗しました。")
    end
```

---

## Signin フロー

`/signin` → `/dashboard`（MFA有効時は `/mfa-verify` 経由）

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant SN as SigninPage
    participant MV as MfaVerifyPage
    participant HK as useSignin hook
    participant FS as authService
    participant API as apiClient(axios)
    participant AC as AuthController
    participant AS as AuthService
    participant CS as CognitoService
    participant CG as AWS Cognito
    participant PR as Prisma Client
    participant DB as SQLite
    participant ST as authStateAtom(Jotai)

    U->>SN: submit(email, password)
    SN->>HK: signinMutation.mutateAsync(payload)
    HK->>FS: signin(payload)
    FS->>API: POST /auth/signin
    API->>AC: POST /auth/signin
    AC->>AS: signIn(SigninDto)
    AS->>CS: initiateAuth(email, password)
    CS->>CG: InitiateAuthCommand(USER_PASSWORD_AUTH)

    alt MFA無効
        CG-->>CS: AuthenticationResult {AccessToken, IdToken, RefreshToken}
        CS-->>AS: InitiateAuthCommandOutput
        AS->>AS: extractSubFromIdToken(idToken)
        AS->>PR: user.upsert(email, cognitoSub)
        PR->>DB: INSERT or UPDATE users
        DB-->>PR: ok
        AS-->>AC: {message: "Sign-in successful.", tokens}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(tokens)
        HK->>ST: setAuthState({accessToken, idToken, refreshToken, expiresAt, isAuthenticated: true})
        HK-->>SN: mutation resolved
        SN->>U: navigate /dashboard
    else MFA有効（EMAIL_OTP チャレンジあり）
        CG-->>CS: ChallengeName=EMAIL_OTP, Session
        CS-->>AS: InitiateAuthCommandOutput
        AS-->>AC: {mfaRequired: true, session, email}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(mfaRequired)
        HK-->>SN: mutation resolved
        SN->>MV: navigate /mfa-verify (location.state: {email, session})
        U->>MV: submit(code)
        MV->>HK: mfaVerifyMutation.mutateAsync({email, session, code})
        HK->>FS: verifyMfa({email, session, code})
        FS->>API: POST /auth/mfa/verify
        API->>AC: POST /auth/mfa/verify
        AC->>AS: verifyMfa(MfaVerifyDto)
        AS->>CS: respondToEmailOtp(email, session, code)
        CS->>CG: RespondToAuthChallengeCommand(EMAIL_OTP)
        CG-->>CS: AuthenticationResult {AccessToken, IdToken, RefreshToken}
        CS-->>AS: RespondToAuthChallengeCommandOutput
        AS->>AS: extractSubFromIdToken(idToken)
        AS->>PR: user.upsert(email, cognitoSub)
        PR->>DB: INSERT or UPDATE users
        DB-->>PR: ok
        AS-->>AC: {tokens}
        AC-->>API: 200 AuthResponse
        API-->>FS: response.data
        FS-->>HK: AuthResponse(tokens)
        MV->>ST: setAuthState({accessToken, idToken, refreshToken, expiresAt, isAuthenticated: true})
        MV->>U: navigate /dashboard
    end

    alt 認証エラー
        CG-->>CS: error (NotAuthorizedException など)
        CS-->>AS: throws
        AS->>AS: mapCognitoError(error) → NestJS HTTP例外
        AS-->>AC: 4xx / 500
        AC-->>API: error response
        API-->>FS: reject
        FS-->>HK: Error
        HK-->>SN: Error("Sign-in failed")
    end
```

---

## トークンリフレッシュ（自動）

`useAutoRefresh` フックが `app.tsx` でグローバルにマウントされ、1分ごとに有効期限を監視する。

```mermaid
sequenceDiagram
    autonumber
    participant AR as useAutoRefresh (interval: 60s)
    participant ST as authStateAtom(Jotai / sessionStorage)
    participant FS as authService
    participant API as apiClient(axios)
    participant AC as AuthController
    participant AS as AuthService
    participant CS as CognitoService
    participant CG as AWS Cognito

    loop 60秒ごと
        AR->>ST: get authState
        ST-->>AR: {refreshToken, expiresAt, isAuthenticated}
        alt 未認証 or refreshToken/expiresAt なし
            AR->>AR: skip
        else expiresAt まで > 5分
            AR->>AR: skip
        else expiresAt まで ≤ 5分（リフレッシュ実行）
            AR->>FS: refreshToken({refreshToken})
            FS->>API: POST /auth/refresh
            API->>AC: POST /auth/refresh
            AC->>AS: refreshTokens(refreshToken)
            AS->>CS: refreshToken(refreshToken)
            CS->>CG: InitiateAuthCommand(REFRESH_TOKEN_AUTH)
            CG-->>CS: AuthenticationResult {AccessToken, IdToken, ExpiresIn}
            Note right of CG: RefreshToken は再発行されない
            CS-->>AS: InitiateAuthCommandOutput
            AS-->>AC: {tokens: {accessToken, idToken, refreshToken(元のまま)}}
            AC-->>API: 200 AuthResponse
            API-->>FS: response.data
            FS-->>AR: AuthResponse(tokens)
            AR->>ST: setAuthState({新AccessToken, 新IdToken, 元RefreshToken, 新expiresAt})
        end
        alt リフレッシュ失敗（トークン失効など）
            CG-->>CS: error
            AR->>ST: setAuthState({all null, isAuthenticated: false})
        end
    end
```
