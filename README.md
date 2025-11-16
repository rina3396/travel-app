# 旅しおり作成アプリ

旅行前後の予定や持ち物を整理し、メンバーと共有できるしおりアプリの MVP です。Next.js 15 / React 19 / Supabase を利用し、App Router ベースで構築しています。

## 使用技術

- Next.js 15（App Router） / React 19 / Turbopack
- TypeScript
- Tailwind CSS v4
- Supabase v2（Auth / Postgres / RLS）
- ESLint / PostCSS
- Node.js 18 以上

## プロジェクト概要

旅行前の計画作成や旅行中の予定確認に使える「旅のしおり」を Web で作成・共有するためのアプリケーションです。日程ごとのアクティビティ管理、タスク（持ち物）管理、予算・費用の記録、共有リンクの発行などを提供します。現在は必要最小限の機能のみ実装しており、ドラッグ＆ドロップなど一部 UI は今後の拡張対象です。

## アプリ URL

- https://travel-app-x46b.vercel.app/

## 環境構築（ローカル開発）

1. Node.js 18 系を用意します（Volta / nvm 推奨）。
2. 依存パッケージをインストールします。
   ```bash
   npm install
   ```
3. `.env.local` を作成し、以下の環境変数を設定します。
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=... # メンバー追加など管理系 API を使う場合
   ```
4. Supabase SQL Editor で `lib/supabase/sql/table_schema.sql` を実行し、テーブル定義と RLS を適用します。
5. 続けて `lib/supabase/sql/dev_seed.sql` を実行し、テストデータを投入します（日本語のサンプル旅行が入ります）。
6. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
7. `http://localhost:3000` にアクセスし、下記テストユーザーでログインできます。
   - メール: `test@example.com`
   - パスワード: `pw0rd1111`

## 変数

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- （必要に応じて）`SUPABASE_SERVICE_ROLE_KEY`、`SUPABASE_DB_URL` など

## テスト用アカウント

- メール: `test@example.com`
- パスワード: `pw0rd1111`

## 未実装機能

- アクティビティ一覧のドラッグ＆ドロップによる並べ替え（UI / API とも未実装）
- TODO / 持ち物リストの高度な管理（担当者割り当て・並べ替えなど）
- 共有ページでのメンバー招待 API（デモ環境では常にエラーメッセージを返しています）
- 予算・費用の自動精算／割り勘機能
- ユーザープロフィールと `profiles` テーブルの同期（display_name 反映）

## 画面一覧

| 画面名           | パス                                      | 説明                                         |
| ---------------- | ---------------------------------------- | -------------------------------------------- |
| LP               | `/`                                      | ランディング（ログイン済みなら `/trips` へ） |
| ログイン         | `/auth/login`                            | メール・パスワードでログイン                 |
| ユーザー登録     | `/auth/register`                         | 新規ユーザー登録フォーム                     |
| ガイド           | `/guide`                                 | 使い方ガイド                                 |
| しおり一覧       | `/trips`                                 | 作成済みしおりの一覧                         |
| 新規作成         | `/trips/new`                             | しおり作成ウィザード                         |
| ダッシュボード   | `/trips/[tripId]`                        | 旅行ごとのハブ画面                           |
| アクティビティ   | `/trips/[tripId]/activities`             | 行程の一覧・作成・編集                       |
| アクティビティ詳細 | `/trips/[tripId]/activities/[activityId]` | 個別行程の詳細・編集                         |
| 日別設定         | `/trips/[tripId]/days`                   | 日付ごとの計画管理                           |
| 持ち物・TODO     | `/trips/[tripId]/tasks`                  | タスク／持ち物の管理                         |
| 予算・費用       | `/trips/[tripId]/budget`                 | 予算設定と支出登録                           |
| 共有             | `/trips/[tripId]/share`                  | メンバー管理・共有リンク（招待は未実装）     |
| 設定             | `/trips/[tripId]/settings`               | タイトル／期間／アーカイブ設定               |
| プレビュー       | `/trips/[tripId]/preview`                | 印刷／共有用プレビュー                       |

##### 画面フォルダ構成

```
app/
├── layout.tsx
├── loading.tsx
├── page.tsx
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── guide/page.tsx
└── trips/
    ├── loading.tsx
    ├── page.tsx
    ├── new/page.tsx
    └── [tripId]/
        ├── layout.tsx
        ├── page.tsx
        ├── activities/
        │   ├── page.tsx
        │   └── [activityId]/page.tsx
        ├── budget/page.tsx
        ├── days/page.tsx
        ├── preview/page.tsx
        ├── settings/page.tsx
        ├── share/page.tsx
        └── tasks/page.tsx
```

## 画面遷移図

![画面遷移図](lib/images/画面遷移図.png)

（BoardMix で作成）https://boardmix.com/jp/

## API ルート

詳細は `lib/docs/api-routes.md` を参照してください（エンドポイント一覧・レスポンス仕様を記載）。

## ディレクトリ構成

- `app/` … Next.js App Router 配下の画面・API ルート
  - `app/api/` … API ルート（サーバーサイド）
  - `app/auth/` … 認証関連画面（ログイン／登録）
  - `app/trips/` … 旅行関連の一覧・ウィザード・詳細画面群
- `components/` … 共通 UI コンポーネント
- `lib/` … Supabase クライアント、SQL、ドキュメント
- `styles/` … Tailwind v4 ベースのグローバル CSS
- `types/` … TypeScript 型定義
- ルート設定ファイル（`next.config.ts`, `tsconfig.json` など）

## データベース（Supabase）

- スキーマ／RLS は `lib/supabase/sql/table_schema.sql` に定義
- シードデータは `lib/supabase/sql/dev_seed.sql` に日本語サンプルを用意
- RLS は `owner`/`editor` のみが更新できるようポリシーを設定済み

## 関連ドキュメント

- テーブル定義 … `lib/docs/table-definitions.md`
>- ER 図 … `lib/docs/er-diagram.md`
- 画面一覧/説明 … `lib/docs/screens.md`
- API 一覧 … `lib/docs/api-routes.md`
- その他構成 … `lib/docs/structure-others.md`

開発を進める際は上記ドキュメントも参照してください。必要に応じて Pull Request で README を更新し、未実装機能のチェックや動作確認手順を追記していきます。
