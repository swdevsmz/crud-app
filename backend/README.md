# CRUDアプリ バックエンド

NestJsベースのバックエンド認証サーバー。AWS Cognito（またはLocalStack）と連携します。

## 技術スタック

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10.4.0
- **Language**: TypeScript 5.6.2
- **Database**: SQLite with Prisma ORM
- **Authentication**: AWS Cognito (LocalStack for local development)
- **HTTP Client**: Axios

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、`.env.example` を参考に設定します。

```bash
cp .env.example .env
```

`.env` ファイルの設定内容：

| 変数名                 | 説明                                          | 例                            |
| ---------------------- | --------------------------------------------- | ----------------------------- |
| `AWS_REGION`           | AWS リージョン                                | `ap-northeast-1`              |
| `COGNITO_USER_POOL_ID` | Cognito ユーザープール ID                     | `ap-northeast-1_xxxxx`        |
| `COGNITO_CLIENT_ID`    | Cognito ネイティブクライアント ID             | `1a2b3c4d5e6f7g8h9i0j`        |
| `LOCALSTACK_ENDPOINT`  | LocalStack エンドポイント（ローカル開発のみ） | `http://localhost:4566`       |
| `DATABASE_URL`         | データベース URL                              | `file:./dev.db`               |
| `PORT`                 | アプリケーションポート                        | `3000`                        |
| `NODE_ENV`             | 実行環境                                      | `development` \| `production` |

**ローカル開発環境での .env 例**:

```env
AWS_REGION=ap-northeast-1
COGNITO_USER_POOL_ID=ap-northeast-1_LOCAL_POOL_ID
COGNITO_CLIENT_ID=LOCAL_CLIENT_ID
LOCALSTACK_ENDPOINT=http://localhost:4566
DATABASE_URL=file:./dev.db
PORT=3000
NODE_ENV=development
```

### 3. 初回データベース構築

マイグレーションをすべて実行してテーブルを作成します。**初回セットアップはこれを実行**：

```bash
npx prisma migrate dev
```

**`dev` は何か？**

- `dev` = 開発環境モード
- 開発中にマイグレーションを作成・実行するコマンド
- データベースが存在しない場合は自動作成
- Prisma Client を自動再生成

本番環境では `npx prisma migrate deploy` を使用（こちらはマイグレーション作成なし、実行のみ）

このコマンドで：

- `prisma/migrations/` 以下のすべてのマイグレーションが適用される
- SQLite `dev.db` ファイルが作成される
- Prisma Client が自動生成される

実行後、初期テーブルが自動的に作成されます。

**シードデータの投入**（オプション）：

`prisma/seed.ts` が定義されている場合、以下で初期データを投入：

```bash
npx prisma db seed
```

例：`prisma/seed.ts` の内容

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // テスト用のユーザーを作成
  await prisma.user.create({
    data: {
      email: "test@example.com",
      cognitoSub: "test-cognito-id",
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

### 4. Prisma セットアップ（詳細）

#### マイグレーションの基本

Prisma マイグレーションの流れ：

1. **`schema.prisma` を編集**（テーブルやカラムの追加・変更）
2. **マイグレーションコマンド実行**
3. **Prisma が自動で SQL を生成・実行**

テーブル単位 or カラム単位ではなく、「スキーマ変更のたびに」マイグレーションを作成します。

#### 実践例

**例1：ユーザーテーブ構造を変更した場合**

`schema.prisma` を編集：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String    // ← 新しく「name」カラムを追加
  createdAt DateTime @default(now())
}
```

その後、コマンド実行：

```bash
npx prisma migrate dev --name add_name_to_user
```

Prismaが自動で以下の SQL を生成・実行：

```sql
ALTER TABLE "User" ADD COLUMN "name" VARCHAR(255) NOT NULL DEFAULT '';
```

**例2：新しいテーブルを追加**

```prisma
model Todo {
  id     String @id @default(cuid())
  title  String
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

model User {
  // ... 既存フィールド ...
  todos  Todo[]  // ← リレーション追加
}
```

実行：

```bash
npx prisma migrate dev --name add_todo_table
```

#### よく使うコマンド

```bash
# 最も一般的：スキーマ変更後、マイグレーションを作成＆実行
npx prisma migrate dev --name <description>

# 対話的実行：マイグレーション名をプロンプトで入力
npx prisma migrate dev

# ローカル開発のみ：全データベースを削除し、マイグレーション履歴からリセット
npx prisma migrate reset
```

#### Prisma Studio（GUI）でデータベースを閲覧・編集

```bash
npx prisma studio
```

ブラウザで `http://localhost:5555` が開き、スキーマとデータを視覚的に操作できます。

#### Prisma Client の再生成

スキーマ変更後、必要に応じて生成し直します：

```bash
npx prisma generate
```

## 実行

### ローカル開発（HTTP サーバー）

開発用のサーバーを起動します：

```bash
npm run start:dev
```

- **Endpoint**: `http://localhost:3000`
- **動作**: ビルド＆実行（ファイル変更時は手動で再実行）

**ホットリロード（自動再起動）を有効にしたい場合**：

```bash
# 1回目のみ：@nestjs/cli をインストール
npm install --save-dev @nestjs/cli

# その後は以下で watch モードで起動
npx nest start --watch
```

通常起動（ビルド済みを実行）：

```bash
npm run start
```

ビルドのみ：

```bash
npm run build
```

- ローカルHTTP実行: `dist/main.js`（`npm run start`）
- Lambda実行: `dist/lambda.js`（デプロイ時にこのハンドラーを指定）

## API エンドポイント

### ヘルスチェック

```bash
curl http://localhost:3000/health
```

レスポンス例：

```json
{
  "status": "ok",
  "timestamp": "2026-03-07T12:34:56Z"
}
```

## 開発時の便利なコマンド

```bash
# Lint 実行
npm run lint

# Type Check
npm run type-check

# Unit Test 実行
npm run test

# Test（Watch モード）
npm run test:watch

# ビルド
npm run build
```

## ローカル環境での Cognito 設定（LocalStack）

LocalStack を使用した Cognito のセットアップ方法：

### 1. Docker Compose でサービス起動

プロジェクトルートの `compose.yaml` で LocalStack を起動：

```bash
cd /workspaces/crud-app
docker-compose up -d
```

### 2. Cognito ユーザープール作成スクリプト

```bash
bash backend/scripts/setup-local-cognito.sh
```

このスクリプトは以下を実行します：

- ローカル Cognito ユーザープール作成
- ユーザープール ID 取得
- ネイティブクライアント作成
- クライアント ID 取得
- `.env` ファイルに自動設定（作成や更新）

## プロジェクト構造

```
backend/
├── src/
│   ├── main.ts              # NestJS ブートストラップ
│   ├── lambda.ts            # Lambda ハンドラー
│   ├── auth/
│   │   ├── auth.module.ts    # Auth モジュール
│   │   ├── auth.service.ts   # Auth ビジネスロジック
│   │   ├── auth.controller.ts # HTTP エンドポイント
│   │   └── cognito.service.ts # AWS Cognito インテグレーション
│   ├── config/
│   │   └── cognito.config.ts # Cognito 設定レジストリ
│   └── common/
│       └── (共通ユーティリティ)
├── prisma/
│   ├── schema.prisma         # Prismaスキーマ定義
│   └── migrations/           # マイグレーション履歴
├── .env.example              # 環境変数テンプレート
├── tsconfig.json             # TypeScript 設定
├── package.json              # 依存パッケージ管理
└── README.md                 # このファイル
```

## トラブルシューティング

### Prisma "datasource" 警告

古い Prisma バージョンで以下の警告が表示される場合がありますが、動作上の問題はありません：

```
warn The datasource property `url` is deprecated. Please use the `provider` field instead.
```

### ポート 3000 が既に使用されている

別のプロセスを確認・終了してください：

```bash
lsof -i :3000
kill -9 <PID>
```

別ポートで起動したい場合は `.env` の `PORT` を変更：

```env
PORT=3001
```

### LocalStack 接続エラー

LocalStack サービスが起動しているか確認：

```bash
docker-compose ps
```

起動していない場合：

```bash
docker-compose up -d
```

## 参考資料

- [NestJS 公式ドキュメント](https://docs.nestjs.com/)
- [Prisma 公式ドキュメント](https://www.prisma.io/docs/)
- [AWS Cognito ドキュメント](https://docs.aws.amazon.com/cognito/)
- [LocalStack ドキュメント](https://docs.localstack.cloud/)
