# Travel App

Next.js 15（App Router）と Supabase v2 を用いた旅行計画アプリです。トリップ、日別計画（Days）/行程（Activities）、タスク、支出/予算、共有リンク、メンバー権限（RLS）などをサポートします。

## プロジェクトの概要
- ログイン後に自分のトリップ一覧を表示し、新規作成や各トリップの詳細管理ができます。
- 行程（Activities）の日付割り当て、並び替え、タスク管理、支出記録と予算の把握、共同編集者の招待・権限管理を備えています。
- DB は Supabase（PostgreSQL）を利用し、行レベルセキュリティ（RLS）でメンバー権限を制御します。

## 使用している主な技術
- Next.js 15 / React 19 / App Router / Turbopack
- TypeScript
- Tailwind CSS v4
- Supabase v2（Postgres, Auth, RLS）
- ESLint / PostCSS

## 必要要件
- Node.js 18 以上
- Supabase プロジェクト（ローカル or クラウド）

## 必要な環境変数
`.env.local` に以下を設定します。

- `NEXT_PUBLIC_SUPABASE_URL`（Supabase プロジェクトURL）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Anonキー）
- `SUPABASE_SERVICE_ROLE_KEY`（必要に応じて。管理系処理で使用）

例:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## コマンド一覧
- 開発サーバ起動: `npm run dev`
- ビルド: `npm run build`
- 本番起動: `npm start`
- Lint: `npm run lint`

## ディレクトリ構成（抜粋）
- `app/` — App Router（ページ/レイアウト/APIルート）
- `components/` — UIコンポーネント
- `lib/supabase/` — SupabaseクライアントとSQL
  - `lib/supabase/sql/table_schema.sql` — スキーマ定義
  - `lib/supabase/sql/dev_seed.sql` — 開発用シード
- `lib/docs/` — ドキュメント
  - `lib/docs/dev.md` — 開発ガイド
  - `lib/docs/table-definitions.md` — テーブル定義サマリ
  - `lib/docs/er-diagram.md` — ER図（Mermaid）
  - `lib/docs/screens.md` — 画面一覧（線付きツリー）
  - `lib/docs/api-routes.md` — API ルート一覧・説明
  - `lib/docs/structure-others.md` — app/api 以外の構成一覧
- `types/` — 型定義
- `styles/` — グローバルCSS

## 開発環境の構築方法
1. 依存関係のインストール
   - `npm install`
2. 環境変数の設定
   - `.env.local` に Supabase のURL/キーを設定
3. データベース初期化（Supabase ダッシュボードの SQL Editor で実行）
   - スキーマ適用: `lib/supabase/sql/table_schema.sql`
   - 開発シード: `lib/supabase/sql/dev_seed.sql`
4. 開発サーバ起動
   - `npm run dev`（http://localhost:3000）

## 画面一覧（主要）
- `/` — ランディング（ログイン済みは `/trips` へリダイレクト）
- `/auth/login` — ログイン
- `/guide` — 使い方ガイド
- `/trips` — トリップ一覧
- `/trips/new` — 新規トリップ作成
- `/trips/[tripId]` — トリップ概要（配下に activities / days / tasks / budget / share / settings / preview）

詳細は `lib/docs/screens.md` を参照してください。

## API ルート（抜粋）
- `POST /api/trips/new` — トリップ作成
- `GET /api/trips/[tripId]/index` — トリップ概要取得
- `GET/POST /api/trips/[tripId]/tasks` — タスク一覧/作成
- `PATCH/DELETE /api/trips/[tripId]/tasks/[taskId]` — タスク更新/削除
- `GET/POST /api/trips/[tripId]/activities` — アクティビティ一覧/作成
- `POST /api/trips/[tripId]/activities/assign-day` — 日付への割当
- `GET/POST /api/trips/[tripId]/days/[date]` — 指定日の作成/取得（無ければ作成）
- `POST /api/trips/[tripId]/days/[date]/activities/reorder` — 並び替え
- `POST /api/trips/[tripId]/budget/expenses` — 支出の追加

詳細は `lib/docs/api-routes.md` を参照してください。

## データベース（Supabase）
- スキーマ/ポリシーは `lib/supabase/sql/table_schema.sql`。
- 行レベルセキュリティ（RLS）有効。メンバーのみ参照、編集は owner / editor のみなどをポリシーで制御。
- テーブル定義の要約とER図は `lib/docs/` を参照。

## 関連ドキュメント（lib/docs）
- 開発ガイド: `lib/docs/dev.md`
- テーブル定義サマリ: `lib/docs/table-definitions.md`
- ER図: `lib/docs/er-diagram.md`
- 画面一覧: `lib/docs/screens.md`
- API ルート一覧・説明: `lib/docs/api-routes.md`
- app/api 以外の構成一覧: `lib/docs/structure-others.md`

## トラブルシューティング
- 画面が空/エラーになる: 環境変数（Supabase URL/Key）が未設定でないか確認。
- 認可エラー（RLS）でデータが取得できない: 該当ユーザーがトリップのメンバーか、またはオーナーか確認。
- `createServer()` / `createClientBrowser()` が失敗する: `.env.local` が正しく設定され、最新値が反映されているか確認。
- シードが入らない: Supabase SQL Editor でエラーが出ていないか、対象のユーザーUUIDをパラメータに渡しているか確認。

## ライセンス
本リポジトリのライセンスはプロジェクト管理者の方針に従います。

