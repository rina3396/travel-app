# app と API 以外のディレクトリ/ファイル一覧

対象外: `app/` 配下（画面・API ルート）。ここでは UI コンポーネント、Supabase クライアント/SQL、型、スタイル、ルート直下の設定をまとめます。

## ツリー（線付き）
```
./
├── components/
│   ├── layout/
│   │   ├── AppFooter.tsx
│   │   └── AppHeader.tsx
│   ├── marketing/
│   │   └── Landing.tsx
│   ├── shadcn/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── ui/
│       ├── BackButton.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Chip.tsx
│       ├── FloatingBackButton.tsx
│       └── Skeleton.tsx
├── lib/
│   ├── docs/
│   │   ├── api-routes.md
│   │   ├── dev.md
│   │   ├── er-diagram.md
│   │   ├── screens.md
│   │   └── table-definitions.md
│   └── supabase/
│       ├── admin.ts
│       ├── client.ts
│       ├── server.ts
│       └── sql/
│           ├── dev_seed.sql
│           └── table_schema.sql
├── styles/
│   └── globals.css
├── types/
│   ├── database.types.ts
│   └── trips.ts
├── .env.example
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## 各ファイル/ディレクトリの説明

- components/
  - layout/AppHeader.tsx: 画面上部のナビゲーション。ログアウトや現在パスに応じた強調表示。
  - layout/AppFooter.tsx: 画面下部のフッター。
  - marketing/Landing.tsx: ランディング/紹介用コンポーネント。
  - shadcn/ui/*: shadcn ベースの UI プリミティブ（Badge, Button, Card）。
  - ui/Button.tsx: ボタン/リンク兼用の共通ボタン（variant/size対応）。
  - ui/Card.tsx: セクション表示用のカード。
  - ui/BackButton.tsx, FloatingBackButton.tsx: 戻る動作のためのUI。
  - ui/Chip.tsx: タグ/小さなラベル表示。
  - ui/Skeleton.tsx: ローディング時のスケルトン表示。

- lib/docs/
  - api-routes.md: API ルートのツリーと仕様説明。
  - dev.md: 開発環境の手順（スキーマ適用/シードなど）。
  - er-diagram.md: ER図（Mermaid）。
  - screens.md: 画面一覧と線付きツリー。
  - table-definitions.md: テーブル定義のサマリ（主キー/外部キー/制約）。

- lib/supabase/
  - server.ts: サーバー用 Supabase クライアント（SSR向け、Cookie連携）。
  - client.ts: ブラウザ用 Supabase クライアント（`@supabase/ssr`）。
  - admin.ts: 管理用クライアント（Service Role利用、ユーザー検索等）。
  - sql/table_schema.sql: DBスキーマ（テーブル・関数・RLSポリシー）。
  - sql/dev_seed.sql: 開発用シードデータ。

- styles/
  - globals.css: Tailwind v4 ベースのグローバルスタイル。

- types/
  - database.types.ts: DB関連の型（Supabase 由来の型定義を含む想定）。
  - trips.ts: トリップ関連のアプリ用型（一覧/作成ペイロード等）。

- ルート設定/メタファイル
  - .env.example: 必須環境変数のサンプル。
  - .env.local: ローカル用の環境変数。
  - .gitignore: Git 管理除外設定。
  - eslint.config.mjs: ESLint 設定。
  - next-env.d.ts: Next.js の型補助。
  - next.config.ts: Next.js 設定。
  - postcss.config.mjs: PostCSS 設定。
  - tsconfig.json: TypeScript 設定。
  - package.json / package-lock.json: 依存/スクリプト定義。
  - README.md: プロジェクトの概要/セットアップ/トラブルシューティング等。

補足:
- `app/`（画面・API ルート）は本書では対象外です。画面一覧は `lib/docs/screens.md`、API は `lib/docs/api-routes.md` を参照してください。

