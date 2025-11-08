# 旅のしおり作成アプリ

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

- Next.js 15 / React 19 / App Router / Turbopack
- TypeScript
- Tailwind CSS v4
- Supabase v2（Postgres, Auth, RLS）
- ESLint / PostCSS

## 必要要件
- Node.js 18 以上
- Supabase プロジェクト（ローカル or クラウド）

## プロジェクトの概要
<!-- まだ記載中 -->
- ログイン後に自分のトリップ一覧を表示し、新規作成や各トリップの詳細管理ができます。
- 行程（Activities）の日付割り当て、並び替え、タスク管理、支出記録と予算の把握、共同編集者の招待・権限管理に対応します。
- DB は Supabase（PostgreSQL）を利用し、行レベルセキュリティ（RLS）でメンバー権限を制御します。

## アプリリンク
<!-- デプロイ後のリンクを貼る。 -->

## テスト用アカウント
- メールアドレス　`test@example.com`
- パスワード　`pw0rd1111`

データは `\lib\supabase\sql\dev_seed.sql` を使用しています。

## 画面一覧
- `/` ランディング。ログイン済みなら `/trips` へ自動遷移。
- `/auth/login` ログイン画面（Email/Password）。成功後 `/trips` へ。
- `/guide` 使い方ガイド。
- `/trips` 自分が閲覧可能なトリップ一覧。
- `/trips/new` 新規トリップの作成フロー。
- `/trips/[tripId]` トリップ概要（各機能へのハブ）。
- `/trips/[tripId]/activities` 行程の一覧・作成・編集・並べ替え。
- `/trips/[tripId]/activities/[activityId]` 個別行程の詳細/編集。
- `/trips/[tripId]/days` 日付単位の計画管理（Trip Day）。
- `/trips/[tripId]/tasks` タスクの一覧・作成・更新・削除。
- `/trips/[tripId]/budget` 予算と支出の表示・支出登録。
- `/trips/[tripId]/share` メンバー招待・権限設定・共有リンク管理。
- `/trips/[tripId]/settings` タイトル・日付・アーカイブ等の設定。
- `/trips/[tripId]/preview` プレビュー用の読み取りビュー。
- （補足）`app/layout.tsx` は全体レイアウト、`app/trips/loading.tsx` 等は読み込み中のスケルトン表示です。

ツリー
```
app/
├── layout.tsx
├── loading.tsx
├── page.tsx
├── auth/
│   └── login/
│       └── page.tsx
├── guide/
│   └── page.tsx
└── trips/
    ├── loading.tsx
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    └── [tripId]/
        ├── layout.tsx
        ├── page.tsx
        ├── activities/
        │   ├── page.tsx
        │   └── [activityId]/
        │       └── page.tsx
        ├── budget/
        │   └── page.tsx
        ├── days/
        │   └── page.tsx
        ├── preview/
        │   └── page.tsx
        ├── settings/
        │   └── page.tsx
        ├── share/
        │   └── page.tsx
        └── tasks/
            └── page.tsx
```

## 画面遷移図
<img src="\lib\docs\画面遷移図.png" alt="画面遷移図"> 

## API ルート
詳細は `lib/docs/api-routes.md` を参照してください（各エンドポイントのメソッド/説明を掲載）。

## ディレクトリ構成
- `app/` Next.js App Router のアプリ本体。
  - `app/api/` API ルート群（サーバサイドのハンドラ）。
    - `app/api/admin/` 開発/管理系エンドポイント（`dev-seed`、`profiles/sync`、`users/lookup`）。
    - `app/api/trips/` トリップ関連エンドポイント（`new`、`[tripId]` 配下に index/activities/days/tasks/budget 等）。
  - `app/auth/` 認証関連の画面（`login`）。
  - `app/guide/` ガイド画面。
  - `app/trips/` トリップの画面群（一覧、新規、`[tripId]` 配下に各タブ画面）。
- `components/` 共有 UI コンポーネント。
  - `components/layout/` ヘッダー/フッター等のレイアウト系。
  - `components/marketing/` ランディング等のマーケ用。
  - `components/shadcn/ui/` shadcn ベースの UI プリミティブ。
  - `components/ui/` アプリ固有の UI コンポーネント。
- `lib/` ライブラリ類。
  - `lib/docs/` ドキュメント（開発ガイド、画面一覧、ER図、API 仕様、テーブル定義、ほか）。
  - `lib/supabase/` Supabase クライアントと SQL。（`server.ts`/`client.ts`/`admin.ts`、`sql/` にスキーマ/シード）
- `styles/` グローバル CSS（Tailwind v4）。
- `types/` 型定義（DB 型、アプリ用型）。
- ルート設定ファイル（抜粋）: `.env.local`, `.gitignore`, `eslint.config.mjs`, `next-env.d.ts`, `next.config.ts`, `package.json`, `postcss.config.mjs`, `tsconfig.json`。

## データベース（Supabase）
- スキーマ/ポリシーは `lib/supabase/sql/table_schema.sql`。
- 行レベルセキュリティ（RLS）有効。メンバーのみ参照、編集は owner / editor のみ等をポリシーで制御。
- テーブル定義の要約と ER 図は `lib/docs/` を参照。

## 関連ドキュメント（lib/docs）
補足資料や設計書を格納しています。
- 開発ガイド: `lib/docs/dev.md`
- テーブル定義: `lib/docs/table-definitions.md`
- ER図: `lib/docs/er-diagram.md`
- 画面一覧: `lib/docs/screens.md`
- API ルート一覧・説明: `lib/docs/api-routes.md`
- その他の構成一覧: `lib/docs/structure-others.md`
