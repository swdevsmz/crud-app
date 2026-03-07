---
description: "メール検証機能付きユーザーサインアップの実装タスク"
---

# タスク: ユーザーサインアップ

**入力**: `/workspaces/crud-app/specs/010-signup/` の設計ドキュメント  
**前提条件**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**テスト**: 仕様で明示的に要求されていないため、MVPではTDDアプローチなしで実装

**構成**: タスクはユーザーストーリー別にグループ化され、各ストーリーの独立した実装とテストを可能にします。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含める

## パス規約

- Webアプリ構造: リポジトリルートに `backend/` と `frontend/`
- バックエンド: `backend/src/`, `backend/tests/`
- フロントエンド: `frontend/src/`, `frontend/tests/`

---

## フェーズ1: セットアップ（共有インフラ）

**目的**: プロジェクトの初期化、依存関係、基本構造

- [x] T001 backend/src/auth/ にバックエンド認証モジュール構造を作成
- [x] T002 [P] バックエンド依存関係をインストール (@aws-sdk/client-cognito-identity-provider, @nestjs/config, class-validator, class-transformer)
- [x] T003 [P] フロントエンド依存関係をインストール (react-router-dom, axios, jotai)
- [x] T004 [P] 必要な変数をすべて含む環境変数テンプレート backend/.env.example と frontend/.env.example を作成
- [x] T005 [P] プロジェクトルートの compose.yaml に LocalStack compose 設定をセットアップ
- [x] T006 backend/scripts/setup-local-cognito.sh に LocalStack Cognito セットアップスクリプトを作成
- [x] T007 [P] backend/tsconfig.json と frontend/tsconfig.json の両方で TypeScript strict mode を設定
- [x] T008 [P] frontend/tailwind.config.js に Tailwind CSS 設定をセットアップ

---

## フェーズ2: 基盤（ブロッキング前提条件）

**目的**: すべてのユーザーストーリー実装前に完了必須のコアインフラ

**⚠️ 重要**: このフェーズが完了するまで、どのユーザーストーリー作業も開始できません

- [x] T009 backend/prisma/schema.prisma に User メタデータモデル用 Prisma スキーマを作成
- [x] T010 Prisma マイグレーションを実行してデータベースを初期化: `npx prisma migrate dev --name init_user_table`
- [x] T011 backend/src/config/cognito.config.ts に環境変数用 NestJS ConfigModule を設定
- [x] T012 backend/src/auth/cognito.service.ts に AWS SDK v3 統合で CognitoService を実装
- [x] T013 backend/src/auth/auth.module.ts に AuthModule を作成し依存関係を登録
- [x] T014 frontend/src/App.tsx に React Router ルート設定をセットアップ
- [x] T015 [P] frontend/src/store/auth-store.ts に Jotai 認証ストアatomを作成
- [x] T016 [P] frontend/src/services/api-client.ts にフロントエンド API クライアント設定を作成
- [x] T017 [P] frontend/src/components/common/form-field.tsx に再利用可能な FormField コンポーネントを作成
- [x] T018 [P] frontend/src/components/common/loading-spinner.tsx に LoadingSpinner コンポーネントを作成
- [x] T019 [P] frontend/src/utils/validation.ts に検証ユーティリティを作成
- [x] T020 デュアルエンドポイントを作成: backend/src/main.ts（ローカルHTTP）と backend/src/lambda.ts（Lambdaハンドラ）

**チェックポイント**: 基盤準備完了 - ユーザーストーリーの実装を並列で開始可能

---

## フェーズ3: ユーザーストーリー1 - アカウント作成成功（優先度: P1）🎯 MVP

**目標**: 新規ユーザーがメール/パスワードサインアップでアカウントを作成でき、メール検証と自動ログインが可能になる

**独立テスト**: /signup に移動、有効な認証情報を入力、アカウント作成を確認、検証メール受信、検証リンクをクリック、ダッシュボードへの自動ログインを確認

### ユーザーストーリー1の実装

#### バックエンド - データレイヤー

- [ ] T021 [P] [US1] backend/src/auth/dto/signup.dto.ts に SignupDto 検証クラスを作成
- [ ] T022 [P] [US1] backend/src/auth/dto/verify-email.dto.ts に VerifyEmailDto 検証クラスを作成
- [ ] T023 [P] [US1] backend/src/auth/interfaces/auth-response.interface.ts にレスポンス型インターフェイスを作成

#### バックエンド - ビジネスロジック

- [ ] T024 [US1] backend/src/auth/auth.service.ts の AuthService に signup メソッドを実装（CognitoService.signUp 呼び出し、エラーハンドリング）
- [ ] T025 [US1] backend/src/auth/auth.service.ts の AuthService に verify-email メソッドを実装（ConfirmSignUp + InitiateAuth で自動ログイン）
- [ ] T026 [US1] backend/src/auth/auth.service.ts のメール検証成功時に Prisma User レコード作成を追加

#### バックエンド - APIエンドポイント

- [ ] T027 [US1] backend/src/auth/auth.controller.ts に POST /auth/signup エンドポイントを実装
- [ ] T028 [US1] backend/src/auth/auth.controller.ts に GET /auth/verify エンドポイントを実装
- [ ] T029 [US1] contracts/signup-api.yaml に合わせて認証エンドポイントに Swagger/OpenAPI デコレータを追加

#### フロントエンド - コンポーネント

- [ ] T030 [P] [US1] frontend/src/components/auth/password-input.tsx に表示/非表示トグル付き PasswordInput コンポーネントを作成
- [ ] T031 [P] [US1] frontend/src/components/auth/signup-form.tsx にメール/パスワード/パスワード確認フィールド付き SignupForm コンポーネントを作成
- [ ] T032 [P] [US1] frontend/src/components/auth/verification-success.tsx に VerificationSuccess コンポーネントを作成

#### フロントエンド - 状態とロジック

- [ ] T033 [US1] frontend/src/hooks/use-signup.ts にサインアップAPI呼び出し用 useSignup カスタムフックを作成
- [ ] T034 [US1] frontend/src/services/auth-service.ts に signup と verifyEmail メソッドを持つ AuthService を作成
- [ ] T035 [US1] frontend/src/types/auth.types.ts に認証型用 TypeScript インターフェイスを作成

#### フロントエンド - ページ

- [ ] T036 [US1] frontend/src/pages/signup.tsx に SignupForm を統合した Signup ページを構築
- [ ] T037 [US1] frontend/src/pages/verify-email.tsx に検証リンクを処理する VerifyEmail ページを構築
- [ ] T038 [US1] frontend/src/App.tsx の React Router に signup と verify ルートを追加

#### 統合

- [ ] T039 [US1] frontend/src/hooks/use-signup.ts の検証後の自動ログイントークンストレージを Jotai ストアに実装
- [ ] T040 [US1] frontend/src/pages/verify-email.tsx の検証成功後の /dashboard への自動リダイレクトを実装
- [ ] T041 [US1] frontend/src/pages/signup.tsx のサインアップ送信後の成功メッセージ表示を追加

**チェックポイント**: この段階でユーザーストーリー1が完全に機能するはず - ユーザーはサインアップ、検証メール受信、検証、ダッシュボードへの自動ログインが可能

---

## フェーズ4: ユーザーストーリー2 - リアルタイムフォーム検証（優先度: P2）

**目標**: フォーム入力に対する即座のフィードバックを提供し、送信前のエラー修正を支援

**独立テスト**: 様々な無効入力（弱いパスワード、無効なメール、不一致パスワード）を入力し、フォーム送信なしで適切なエラーメッセージがリアルタイムで表示されることを確認

### ユーザーストーリー2の実装

#### フロントエンド - 検証ロジック

- [ ] T042 [P] [US2] frontend/src/hooks/use-form-validation.ts にデバウンスサポート付き useFormValidation フックを作成
- [ ] T043 [P] [US2] frontend/src/utils/validation.ts にメール形式検証を実装
- [ ] T044 [P] [US2] frontend/src/utils/validation.ts にルールチェックリスト付きパスワード強度検証を実装
- [ ] T045 [P] [US2] frontend/src/utils/validation.ts にパスワード一致検証を実装

#### フロントエンド - UI機能強化

- [ ] T046 [US2] frontend/src/components/auth/signup-form.tsx のメールフィールドにリアルタイム検証を追加
- [ ] T047 [US2] frontend/src/components/auth/password-input.tsx にパスワード強度要件チェックリスト表示を追加
- [ ] T048 [US2] frontend/src/components/auth/signup-form.tsx にパスワード確認のリアルタイム一致検証を追加
- [ ] T049 [US2] frontend/src/components/auth/signup-form.tsx の検証エラー時に送信ボタンを無効化
- [ ] T050 [US2] frontend/src/components/common/form-field.tsx の FormField コンポーネントにフィールドごとのエラーメッセージ表示を追加

#### フロントエンド - UX改善

- [ ] T051 [US2] frontend/src/hooks/use-form-validation.ts に段階的エラー表示を実装（blurまたは送信試行後のみエラーを表示）
- [ ] T052 [US2] frontend/src/components/common/form-field.tsx に有効フィールド用の視覚的フィードバック（緑のチェックマークまたはボーダー）を追加

**チェックポイント**: この段階でユーザーストーリー1と 2の両方が機能するはず - ユーザーはリアルタイム検証フィードバックを受け、サインアップを成功裏に完了可能

---

## フェーズ5: ユーザーストーリー3 - エラーハンドリング（優先度: P3）

**目標**: 重複アカウント、ネットワーク問題、サービス障害に対する明確で実行可能なエラーメッセージでエラーケースを適切に処理

**独立テスト**: 様々なエラー状態（重複メール、ネットワークタイムアウト、サービス利用不可）をシミュレートし、UXを壊さずに適切なエラーメッセージが表示されることを確認

### ユーザーストーリー3の実装

#### バックエンド - エラーハンドリング

- [ ] T053 [P] [US3] backend/src/common/filters/cognito-exception.filter.ts に Cognito エラー用カスタム例外フィルタを作成
- [ ] T054 [P] [US3] backend/src/auth/exceptions/duplicate-email.exception.ts に重複メール用カスタム例外（HTTP 409）を作成
- [ ] T055 [US3] backend/src/auth/auth.service.ts の AuthService.signup に重複メール検出を追加
- [ ] T056 [US3] backend/src/auth/auth.service.ts に Cognito エラーをユーザーフレンドリーメッセージへのマッピングを追加
- [ ] T057 [US3] backend/src/auth/cognito.service.ts に一時的な AWS SDK 失敗用リトライロジックを追加

#### フロントエンド - エラーハンドリング

- [ ] T058 [P] [US3] frontend/src/constants/error-messages.ts にエラーメッセージ定数を作成
- [ ] T059 [US3] frontend/src/services/api-client.ts の axios インターセプターにネットワークエラーハンドリングを追加
- [ ] T060 [US3] frontend/src/hooks/use-signup.ts のサインアップフローに重複メールエラーハンドリングを追加
- [ ] T061 [US3] frontend/src/components/auth/signup-form.tsx にネットワークタイムアウトエラー表示を追加
- [ ] T062 [US3] frontend/src/components/auth/signup-form.tsx にサービス利用不可エラー表示を追加
- [ ] T063 [US3] frontend/src/pages/verify-email.tsx に無効な検証コードエラーハンドリングを追加
- [ ] T064 [US3] frontend/src/pages/verify-email.tsx に期限切れ検証コードエラーハンドリングを追加

#### フロントエンド - UX仕上げ

- [ ] T065 [US3] frontend/src/hooks/use-form-validation.ts にフィールド変更時のエラーメッセージ自動クリアを実装
- [ ] T066 [US3] frontend/src/components/auth/signup-form.tsx に重複送信防止用のローディング状態管理を追加

**チェックポイント**: すべてのユーザーストーリーが堅牢なエラーハンドリングで独立して機能するはず

---

## フェーズ6: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーと全体品質に影響する改善

- [ ] T067 [P] backend/src/auth/ のすべてのバックエンドサービスに包括的な JSDoc コメントを追加
- [ ] T068 [P] frontend/src/hooks/ のすべてのフロントエンドフックに包括的な JSDoc コメントを追加
- [ ] T069 [P] すべてのコンポーネントでモバイルビューポート（320px-768px）でレスポンシブデザインが機能することを確認
- [ ] T070 [P] サインアップフォームコンポーネントでアクセシビリティ（ARIAラベル、キーボードナビゲーション）を確認
- [ ] T071 backend/src/auth/dto/ に XSS 防止用の入力サニタイゼーションを追加
- [ ] T072 backend/ と frontend/ で ESLint を実行しすべての警告を修正
- [ ] T073 Prettier を実行しすべてのコードをフォーマット
- [ ] T074 spec.md のすべての FR 要件 (FR-001 to FR-017) が実装されていることを確認
- [ ] T075 quickstart.md のステップ1から完了までの検証を実行
- [ ] T076 サインアップ機能ドキュメントで README.md を更新
- [ ] T077 @nestjs/swagger を使用して Swagger デコレータから API ドキュメントを生成

---

## 依存関係と実行順序

### フェーズ依存関係

- **セットアップ（フェーズ1）**: 依存関係なし - すぐに開始可能
- **基盤（フェーズ2）**: セットアップ完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー1（フェーズ3）**: 基盤フェーズ完了に依存 - 他のストーリーへの依存関係なし
- **ユーザーストーリー2（フェーズ4）**: 基盤フェーズ完了に依存 - US1を強化するが独立してテスト可能
- **ユーザーストーリー3（フェーズ5）**: 基盤フェーズ完了に依存 - US1とUS2を強化するが独立してテスト可能
- **仕上げ（フェーズ6）**: 希望するすべてのユーザーストーリー完了に依存

### ユーザーストーリー依存関係

- **ユーザーストーリー1 (P1)**: 基盤（フェーズ2）後に開始可能 - 独立したコア機能
- **ユーザーストーリー2 (P2)**: 基盤（フェーズ2）後に開始可能 - US1にリアルタイム検証を追加
- **ユーザーストーリー3 (P3)**: 基盤（フェーズ2）後に開始可能 - US1とUS2にエラーハンドリングを追加

### 各ユーザーストーリー内

**ユーザーストーリー1**:

1. DTOとインターフェイス (T021-T023) は並列実行可能
2. ビジネスロジック (T024-T026) はDTOに依存
3. APIエンドポイント (T027-T029) はビジネスロジックに依存
4. フロントエンドコンポーネント (T030-T032) は並列実行可能
5. フロントエンド状態とロジック (T033-T035) はコンポーネント後に実行
6. ページ (T036-T038) はすべてを統合
7. 統合タスク (T039-T041) でストーリー完成

**ユーザーストーリー2**:

1. 検証ロジック (T042-T045) は並列実行可能
2. UI機能強化 (T046-T050) は検証ロジックを使用
3. UX改善 (T051-T052) で体験を仕上げ

**ユーザーストーリー3**:

1. バックエンドエラーハンドリング (T053-T057) は[P]マークの箇所で並列実行可能
2. フロントエンドエラーハンドリング (T058-T064) は[P]マークの箇所で並列実行可能
3. UX仕上げ (T065-T066) でストーリー完成

### 並列実行機会

**フェーズ1（セットアップ）**: T002, T003, T004, T005, T007, T008 はすべて並列実行可能

**フェーズ2（基盤）**: T015, T016, T017, T018, T019 はT014後にすべて並列実行可能

**ユーザーストーリー1**:

- DTO: T021, T022, T023 を並列実行
- コンポーネント: T030, T031, T032 を並列実行

**ユーザーストーリー2**:

- バリデータ: T042, T043, T044, T045 を並列実行

**ユーザーストーリー3**:

- バックエンドエラー: T053, T054 を並列実行
- フロントエンドエラー: T058 はいつでも開始可能

**仕上げフェーズ**: T067, T068, T069, T070, T072 はすべて並列実行可能

---

## 並列実行例: ユーザーストーリー1 - バックエンドDTO

```bash
# すべてのDTO作成タスクを同時に起動（異なるファイル）:
Task T021: "backend/src/auth/dto/signup.dto.ts に SignupDto 検証クラスを作成"
Task T022: "backend/src/auth/dto/verify-email.dto.ts に VerifyEmailDto 検証クラスを作成"
Task T023: "backend/src/auth/interfaces/auth-response.interface.ts にレスポンス型インターフェイスを作成"
```

## 並列実行例: ユーザーストーリー1 - フロントエンドコンポーネント

```bash
# すべてのコンポーネント作成タスクを同時に起動（異なるファイル）:
Task T030: "frontend/src/components/auth/password-input.tsx に表示/非表示トグル付き PasswordInput コンポーネントを作成"
Task T031: "frontend/src/components/auth/signup-form.tsx に SignupForm コンポーネントを作成"
Task T032: "frontend/src/components/auth/verification-success.tsx に VerificationSuccess コンポーネントを作成"
```

---

## 実装戦略

### MVP優先（ユーザーストーリー1のみ）

1. フェーズ1完了: セットアップ (T001-T008)
2. フェーズ2完了: 基盤 (T009-T020) - 重要なブロッキングフェーズ
3. フェーズ3完了: ユーザーストーリー1 (T021-T041)
4. **停止して検証**:
   - spec.md の受入基準に従ってサインアップフローをエンドツーエンドでテスト
   - メール検証が機能することを確認
   - ダッシュボードへの自動ログイン機能を確認
5. 準備ができていればデプロイ/デモ

**結果**: メール検証と自動ログイン機能を持つサインアップ機能（FR-001からFR-017までのすべての要件を満たす）

### 段階的デリバリー

1. **基盤**（フェーズ1-2）: セットアップ + 共有インフラ → 20タスク
2. **MVP**（フェーズ3）: ユーザーストーリー1のみ → +21タスク（計41）
   - デプロイ: メール検証付き基本サインアップ ✅
3. **UX強化**（フェーズ4）: ユーザーストーリー2追加 → +11タスク（計52）
   - デプロイ: UX向上のためのリアルタイム検証 ✅
4. **本番環境準備完了**（フェーズ5）: ユーザーストーリー3追加 → +14タスク（計66）
   - デプロイ: 本番環境用の堅牢なエラーハンドリング ✅
5. **仕上げ**（フェーズ6）: 横断的改善 → +11タスク（計77）
   - デプロイ: 完成、洗練された機能 ✅

### 並列チーム戦略

複数の開発者と（基盤フェーズ完了後）:

1. **開発者A**: ユーザーストーリー1（コアサインアップ） - 最高優先
2. **開発者B**: ユーザーストーリー2（検証） - 並列開発
3. **開発者C**: ユーザーストーリー3（エラーハンドリング） - 並列開発
4. **統合**: ストーリーは競合なしで独立してマージ（異なるコンポーネント）

---

## 検証チェックリスト

機能完了とマークする前に、以下を確認:

- [ ] spec.md のすべての機能要件 (FR-001 to FR-017) が実装されている
- [ ] spec.md のすべての成功基準 (SC-001 to SC-007) が満たされている
- [ ] すべてのユーザーストーリー受入シナリオがパスする
- [ ] plan.md の憲法チェック項目がまだパスする
- [ ] quickstart.md のフローがエンドツーエンドで機能する
- [ ] APIコントラクトが contracts/signup-api.yaml と完全に一致する
- [ ] セキュリティ脆弱性がない（入力サニタイゼーション、認証情報漏洩なし）
- [ ] バックエンドとフロントエンドの両方でlintとtype-checkがパスする
- [ ] すべての環境変数が .env.example ファイルにドキュメント化されている
- [ ] LocalStack Cognito セットアップスクリプトが正常に機能する
- [ ] コードが .github/copilot-instructions.md の規約に従っている

---

## 注記

- **テスト**: spec.mdでテストが明示的に要求されていないため含まれていません。TDDが必要な場合は、各ユーザーストーリーフェーズの実装タスク前にテストタスクを追加してください。
- **[P]マーカー**: 並列実行可能なタスクを示します（異なるファイル、依存関係なし）
- **[Story]ラベル**: トレーサビリティのためにspec.mdの特定ユーザーストーリーにタスクをマッピング
- **ファイルパス**: すべてのパスは正確でplan.mdで定義された構造と一致します
- **段階的価値**: 各ユーザーストーリーは以前のストーリーを壊すことなく価値を追加します
- **独立テスト**: 各ユーザーストーリーはspec.mdの受入基準に従って独立してテスト可能です
- **コスト意識**: すべての決定はAWS無料枠を優先します（LocalStack、Cognito無料枠、Lambda最適化）
- **セキュリティ**: plan.mdのセキュリティ基礎に従って、入力検証、パスワード非保存、Cognito管理認証
