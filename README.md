# 旅しおり作成アプリ

## 使用技術
<p>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white&style=flat-square"></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=flat-square"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square"></a>
  <a href="https://supabase.com/"><img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=flat-square"></a>
  <a href="https://www.postgresql.org/"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square"></a>
  <a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square"></a>
  <a href="https://eslint.org/"><img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square"></a>
  <a href="https://postcss.org/"><img alt="PostCSS" src="https://img.shields.io/badge/PostCSS-DD3A0A?logo=postcss&logoColor=white&style=flat-square"></a>
  <a href="https://vercel.com/turbopack"><img alt="Turbopack" src="https://img.shields.io/badge/Turbopack-000000?logo=vercel&logoColor=white&style=flat-square"></a>
</p>

- Next.js 15（App Router） / React 19 / Turbopack
- TypeScript
- Tailwind CSS v4
- Supabase v2（Auth / Postgres / RLS）
- ESLint / PostCSS
- Node.js 18 以上

## プロジェクト概要
旅行前の計画や準備、旅行中の予定確認に使用する「旅のしおり」を作成するアプリケーションです。<br><br>
機能は、日程ごとの予定を一覧化しタイムスケジュールに沿って予定を作成する機能や、旅行前の予約や持ち物の準備などをリスト化し共有できる機能があります。<br>
本アプリの目的としては、旅行の際に最低限必要な情報のみを可視化できることと、共有できること、旅のしおりの作成に手間がかからないこととしているため、使いやすさを重視して実装となっています。<br><br>
技術的な面では、ログイン機能やユーザー登録機能を実装し、ログインできる登録されたユーザーごとに旅のしおりを作成することができます。<br>
データベース（バックエンド部分）は Supabaseを利用し、行レベルセキュリティ（RLS）で、ユーザー登録やデータ管理を制御しています。


## アプリ URL
- https://travel-app-oifk.vercel.app

## テスト用アカウント
- メールアドレス 
  ```
  test@example.com
  ```
- パスワード
  ```
  pw0rd1111
  ```

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
5. 続けて `lib/supabase/sql/dev_seed.sql` を実行し、テストデータを投入します。
6. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
7. `http://localhost:3000` にアクセスし、テストユーザーでログインできます。

## 変数
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 画面一覧
| 画面名           | パス                                      | 説明                                         |
| ---------------- | ---------------------------------------- | -------------------------------------------- |
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
| 設定             | `/trips/[tripId]/settings`               | タイトル・期間編集/しおりの削除              |
| プレビュー       | `/trips/[tripId]/preview`                | プレビュー                       |

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
- ER 図 … `lib/docs/er-diagram.md`
- 画面一覧/説明 … `lib/docs/screens.md`
- API 一覧 … `lib/docs/api-routes.md`
- その他構成 … `lib/docs/structure-others.md`

## 未実装機能
- アクティビティ一覧のドラッグ＆ドロップによる並べ替え（UI / API とも未実装）
- TODO / 持ち物リストの高度な管理（担当者割り当て・並べ替えなど）
- 共有ページでのメンバー招待 API（デモ環境では常にエラーメッセージを返しています）
- 予算・費用の自動精算／割り勘機能
- ユーザープロフィールと `profiles` テーブルの同期（display_name 反映）

