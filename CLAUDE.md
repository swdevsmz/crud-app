# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

学習目的のSpec-First CRUDアプリ。AWS Cognitoを使った認証基盤を構築する。MVPスコープ：サインアップ、ログイン（MFA/2FA）、TOPメニュー、TODO CRUD。コスト最小化のため、RDSではなくSQLiteを使用し、AWSフリーティア範囲に収める設計。

## コマンド

### バックエンド（`cd backend`）
```bash
npm run build          # TypeScriptをdist/にコンパイル
npm run build:watch    # ウォッチモードでコンパイル
npm run start:dev      # ビルド＆起動（ポート3000）
npm run type-check     # 型チェックのみ（出力なし）
npm run lint           # ESLint（src/**/*.ts）
npm run format         # Prettier（src/**/*.ts）
```

### フロントエンド（`cd frontend`）
```bash
npm run dev            # Vite開発サーバー（ポート5173）
npm run build          # プロダクションビルド
npm run type-check     # TypeScript型チェック
npm run lint           # ESLint（src/**/*.{ts,tsx}）
npm run format         # Prettier（src/**/*.{ts,tsx,css}）
npm run test           # Vitest（1回実行）
npm run test:watch     # Vitestウォッチモード
npm run storybook      # Storybook（ポート6006）
```

### 単一テストの実行
```bash
cd frontend && npx vitest run src/pages/auth/signup-page.test.tsx
```

### CIゲート（PR必須）
`lint` → `type-check` → `test` → `build` の順に`.github/workflows/ci.yml`で自動実行される。

## アーキテクチャ

### モノリポ構成
- `backend/` — NestJS TypeScript API（ポート3000）
- `frontend/` — React + Vite TypeScript SPA（ポート5173）
- `infra/terraform/` — AWS Cognito用Terraform
- `specs/` — 機能ごとのSpecKitアーティファクト（`spec.md`、`plan.md`、`tasks.md`）

### バックエンド（NestJS）

機能モジュールは`src/features/internal/`以下に配置。ガード・フィルター・インターセプター・デコレーターなどの共通インフラは`src/common/`に集約。

エントリーポイント：
- `src/main.ts` — ローカルHTTPサーバー
- `src/lambda.ts` — AWS Lambdaハンドラー（スタブ）

認証フロー：`AuthController` → `AuthService` → `CognitoService`（AWS SDKラッパー）。Cognito確認後、`AuthService`が`cognitoSub`をキーにSQLiteの`User`レコードをupsertする。

DB：Prisma + SQLite。スキーマは`backend/prisma/schema.prisma`。LambdaではDBパスが`/tmp/dev.db`（揮発性・学習用）。

### フロントエンド（React + Vite）

機能モジュールは`src/features/`以下に配置。ルートレベルのページは`src/pages/`。APIクライアント・バリデーション・共通UIは`src/shared/`。

状態管理：Jotai（`features/auth/model/auth-store.ts` — `authStateAtom`、`isAuthenticatedAtom`）  
HTTP：Axios（`shared/api/api-client`経由）  
データフェッチ：TanStack React Query v5  
フォーム：React Hook Form  
テスト：Vitest + React Testing Library + MSW

### 認証フロー（サインアップ → メール確認 → サインイン）
1. `POST /auth/signup` — Cognitoが未確認ユーザーを作成し、確認コードをメール送信
2. `GET /auth/verify?email=&code=&password=` — コード確認、自動サインイン、SQLiteユーザーupsert、トークン返却
3. `POST /auth/signin` — `USER_PASSWORD_AUTH`フロー、トークン返却
4. フロントエンドがverify/signin後に`{ accessToken, idToken, isAuthenticated }`をJotaiアトムに格納

### インフラ
`infra/terraform/`でCognito User PoolとApp Clientを構築（メール認証、MFAなし・MVP段階）。RDSは使わずSQLiteのみ。

## コーディング規約

- TypeScript strictモード（フロントエンド・バックエンド両方）
- ファイル名はケバブケース（`auth-service.ts`、`use-signup.ts`）
- インデント2スペース、シングルクォート
- バックエンドのDTOには`class-validator`デコレーターを使用
- シークレットはハードコード禁止 — `.env`を使用（各プロジェクトの`.env.example`参照）

## 開発ワークフロー（SpecKit）

すべての機能は`specs/<issue>/`以下の3アーティファクト構成で進める：
1. `spec.md` — ユーザーストーリーと受け入れ条件
2. `plan.md` — 技術設計・アプローチ
3. `tasks.md` — 実装チェックリスト

ブランチ命名規則：`feature/issue-<n>-<slug>` または `bugfix/issue-<n>-<slug>`。PRはスカッシュマージ。`main`への直接プッシュ禁止。

## 環境設定

**バックエンド** — `backend/.env.example`を`backend/.env`にコピー：
```
AWS_REGION=ap-northeast-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
DATABASE_URL=file:./dev.db
PORT=3000
NODE_ENV=development
```

**フロントエンド** — `frontend/.env.example`を`frontend/.env`にコピー：
```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MSW=false
```

devコンテナ（`.devcontainer/`）はNode 22、GitHub CLI、Terraform、AWS CLIを提供し、`devcontainer.local.env`（`devcontainer.local.env.sample`参照）からGit/AWS認証情報を分離設定する。
