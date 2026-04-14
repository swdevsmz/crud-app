import axios from 'axios';

/**
 * Cognitoエラーコードをユーザー向けの日本語メッセージに変換するマップ。
 * バックエンドがCognitoのエラーをそのまま返す場合に備えてフロントでも変換する。
 */
const COGNITO_ERROR_MAP: Record<string, string> = {
    UsernameExistsException: 'このメールアドレスはすでに登録されています。',
    UserNotFoundException: 'メールアドレスまたはパスワードが正しくありません。',
    NotAuthorizedException: 'メールアドレスまたはパスワードが正しくありません。',
    CodeMismatchException: '確認コードが正しくありません。',
    ExpiredCodeException: '確認コードの有効期限が切れています。再送信してください。',
    LimitExceededException: '試行回数が上限を超えました。しばらく時間をおいて再試行してください。',
    TooManyRequestsException: 'リクエストが多すぎます。しばらく時間をおいて再試行してください。',
    InvalidParameterException: '入力内容に誤りがあります。確認してください。',
    InvalidPasswordException: 'パスワードの形式が正しくありません。8文字以上で、大文字・小文字・数字・記号を含めてください。',
    UserNotConfirmedException: 'メールアドレスの確認が完了していません。確認コードを入力してください。',
};

/**
 * エラーメッセージ文字列にCognitoエラーコードが含まれていれば日本語に変換する。
 * 該当するコードがなければ null を返す（呼び出し元で元のメッセージを使う）。
 */
function translateCognitoError(message: string): string | null {
    // Cognito validation error (e.g. missing clientId due to misconfiguration)
    if (message.includes('validation errors detected') || message.includes('clientId')) {
        return 'サービスの設定に問題が発生しました。管理者にお問い合わせください。';
    }

    for (const [code, translated] of Object.entries(COGNITO_ERROR_MAP)) {
        if (message.includes(code)) {
            return translated;
        }
    }

    return null;
}

/**
 * API呼び出しで発生したエラーからユーザー表示用メッセージを返す。
 * Axiosエラー → Cognitoエラー変換 → Error.message → fallback の順で処理する。
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string } | undefined;
        const raw = responseData?.message ?? error.message;
        if (raw) {
            return translateCognitoError(raw) ?? raw;
        }
    }

    if (error instanceof Error && error.message) {
        return translateCognitoError(error.message) ?? error.message;
    }

    return fallback;
}
