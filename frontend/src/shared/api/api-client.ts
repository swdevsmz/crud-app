import axios, { type AxiosInstance } from 'axios';

// ベースURLは環境変数から取得。未設定時はローカル開発用にフォールバック
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

/**
 * アプリ全体で共通使用する Axios インスタンス。
 * すべてのAPIリクエストはこのクライアントを通じて送信する。
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'content-type': 'application/json'
  },
  // 10秒でタイムアウト（ネットワーク遅延によるUIフリーズを防止）
  timeout: 10000
});
