# 開発ガイド（ローカルセットアップ）

このドキュメントは、Travel App の開発環境を最短で立ち上げるための手順をまとめたものです。DB スキーマの適用、シード、環境変数、動作確認、トラブル対応までを網羅します。

## 前提
- Node.js 18 以上
- Supabase プロジェクト（クラウド or ローカル）（Postgres + Auth 有効）
- psql が使えること（または Supabase の SQL Editor を使用）

## 環境変数（.env.local）
プロジェクト直下に `.env.local` を作成し、以下を設定します。

- `NEXT_PUBLIC_SUPABASE_URL`（Supabase プロジェクト URL）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Anon キー）
- `SUPABASE_SERVICE_ROLE_KEY`（必要に応じて。Service Role で管理系処理に使用）

例:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## 初期セットアップ
1) 依存インストール
   - `npm install`

2) DB スキーマ適用（どちらかの方法）
   - Supabase SQL Editor で `lib/supabase/sql/table_schema.sql` を実行
   - もしくは psql で実行:
     - Bash: `psql "$DATABASE_URL" -f lib/supabase/sql/table_schema.sql`
     - PowerShell: `psql "$env:DATABASE_URL" -f lib/supabase/sql/table_schema.sql`

3) テストユーザー準備（任意）
   - Supabase Dashboard → Authentication → Users → Add user で作成
   - 例: Email `test@example.com` / Password `pw0rd1111`

4) シード（任意）
   - Supabase SQL Editor で `lib/supabase/sql/dev_seed.sql` を実行
   - もしくは psql でユーザー UUID を渡して実行:
     - Bash: `psql "$DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/sql/dev_seed.sql`
     - PowerShell: `psql "$env:DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/sql/dev_seed.sql`
   - ユーザー UUID の取得例（psql）: `select id,email from auth.users where email='test@example.com';`

## 開発サーバーの起動
- `npm run dev`
- ブラウザで `http://localhost:3000` を開く
- 未ログイン時は `/auth/login` へ。ログイン後は `/trips` に遷移

## 動作確認チェックリスト（画面）
- `/` ランディング（ログイン済みは `/trips` へリダイレクト）
- `/auth/login` ログインできること（ログイン後 `/trips`）
- `/trips` 自分が見えるトリップの一覧が表示されること
- `/trips/new` 新規トリップ作成が成功すること
- `/trips/[tripId]` 概要タブが開けること
- 各機能タブ
  - `/trips/[tripId]/activities` 行程の作成/並べ替え
  - `/trips/[tripId]/days` 日付の作成/確認
  - `/trips/[tripId]/tasks` タスクの追加/更新/削除
  - `/trips/[tripId]/budget` 支出の追加と一覧
  - `/trips/[tripId]/share` メンバー/権限の管理
  - `/trips/[tripId]/settings` タイトル/日付など設定変更

## 動作確認（API 例・任意）
- 作成: `POST /api/trips/new` body: `{ "title": "My Trip", "startDate": "2025-01-01" }`
- 一覧: `GET /api/trips/:tripId/activities`
- タスク作成: `POST /api/trips/:tripId/tasks` body: `{ "title": "Pack" }`
- 支出作成: `POST /api/trips/:tripId/budget/expenses` body: `{ "date":"2025-01-02", "title":"Taxi", "amount":1200 }`

詳細は `lib/docs/api-routes.md` を参照してください。

## よくあるトラブルと対処
- 空画面/エラーになる
  - `.env.local` の URL/キーが未設定・誤りの可能性。再設定してサーバーを再起動。
- データが取得できない（RLS）
  - ログインユーザーがトリップのメンバー/オーナーか確認。RLS ポリシーにより非メンバーは見えません。
- Supabase への SQL 適用に失敗する
  - `DATABASE_URL`（Direct 接続）の値、権限を確認。既存オブジェクトがある場合は `if not exists` を確認。
- シードが入らない
  - 参照するユーザー UUID が正しいか、SQL Editor のエラーを確認。

## 参考ドキュメント
- テーブル定義サマリ: `lib/docs/table-definitions.md`
- ER 図（Mermaid）: `lib/docs/er-diagram.md`
- 画面一覧: `lib/docs/screens.md`
- API ルート一覧・仕様: `lib/docs/api-routes.md`
- 構成（app/api 以外）: `lib/docs/structure-others.md`

