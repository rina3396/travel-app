# チーム向けテスト運用ガイド

## 目的
- 全員が同じ手順で「テストアカウント＋サンプルデータ」を投入し、画面で動作確認できるようにする。

## 前提
- Node.js 18+ 推奨、依存関係: `npm i`
- 環境変数（`.env.local`）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`（管理API用。サーバー専用）
  - `ADMIN_ENDPOINT_SECRET`（管理API保護用の強いシークレット）
- DBスキーマが適用済み（`lib/supabase/migrations/table_schema.sql`）
- アプリ起動: `npm run dev`

## 推奨フロー（方法B: SQLを直接流す）
1) Supabaseでテストユーザーを作成
   - Supabase Dashboard → Authentication → Users → Add user
   - 例: dev-owner@example.com / Passw0rd!、dev-editor@example.com / Passw0rd!
2) ユーザーUUIDを取得
   - Dashboardのユーザー詳細からIDをコピー、または SQL で取得:
     - Bash例: `psql "$DATABASE_URL" -c "select id,email from auth.users where email in ('dev-owner@example.com','dev-editor@example.com');"`
     - PowerShell例: `psql "$env:DATABASE_URL" -c "select id,email from auth.users where email in ('dev-owner@example.com','dev-editor@example.com');"`
3) シードSQLの実行
   - ファイル: `lib/supabase/migrations/dev_seed.sql`
   - Bash例: `psql "$DATABASE_URL" -v USER_1="'<OWNER_UUID>'" -v USER_2=""'<EDITOR_UUID>'" -f lib/supabase/migrations/dev_seed.sql`
   - PowerShell例: `psql "$env:DATABASE_URL" -v USER_1="'<OWNER_UUID>'" -v USER_2=""'<EDITOR_UUID>'" -f lib/supabase/migrations/dev_seed.sql`
   - 補足: `DATABASE_URL` は Supabase Project → Settings → Database → Connection string から取得（Direct接続のPostgres）
4) ログイン（/auth/login）
   - dev-owner@example.com / Passw0rd!
   - dev-editor@example.com / Passw0rd!

## 代替フロー（方法A: 管理APIで一括シード）
- 実行: `npm run seed:dev`
  - `x-admin-secret` を付けて `POST /api/admin/dev-seed` を叩きます
- 直接cURL: `curl -X POST http://localhost:3000/api/admin/dev-seed -H "Content-Type: application/json" -H "x-admin-secret: $ADMIN_ENDPOINT_SECRET" -d '{"baseDate":"2025-11-01"}'`

## 確認手順（推奨）
- `/trips` 旅行一覧が表示される
- `/trips/{tripId}/activities?date=YYYY-MM-DD`
  - 「アクティビティを追加」で追加→一覧反映
  - 「未割り当てをこの日に移動」で当日に移動
  - アイテムの「削除」動作
- `/trips/{tripId}/activities/{activityId}` 詳細編集（タイトル/時刻/場所/メモ）→「保存」「削除」
- `/trips/{tripId}/budget` 予算/経費が見える
- `/trips/{tripId}/tasks` タスクが見える
- スクロールしてもヘッダーが固定表示（レイアウト確認）

## 片付け・再シード
- Trip単位で削除: `DELETE /api/trips/{tripId}`
- 再シード: 方法BのSQLを再実行（必要に応じて日付やデータを調整）

## セキュリティ注意
- `app/api/admin/*` は管理・開発用。`x-admin-secret` ヘッダで保護済み
  - `.env.local` に `ADMIN_ENDPOINT_SECRET` を設定し、チーム内で安全に共有
  - 本番ではさらに制限（IP制限/VPN/認証）を推奨
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー専用。クライアントに露出させない
- ランタイム強制: 管理APIは `runtime = 'nodejs'`

## ステージング共有
- 環境変数（Supabaseキー、`ADMIN_ENDPOINT_SECRET`）をステージングにも設定
- シード投入例
  - `curl -X POST https://staging.example.com/api/admin/dev-seed -H "Content-Type: application/json" -H "x-admin-secret: <SECRET>" -d '{"baseDate":"2025-11-01"}'`
- メンバーにURL、ログイン情報、必要ならシークレットを共有

## トラブルシュート
- psql接続エラー: `DATABASE_URL`（ホスト/ユーザー/パスワード/ポート）を再確認
- 401/403/500（方法A時）: `ADMIN_ENDPOINT_SECRET` 不一致 / Service Role Key未設定
- テーブル無し/参照エラー: `table_schema.sql` を適用後に再実行
- 日付ズレ: `baseDate` と表示のズレがある場合は1日進めて試す

## 参考（整備点）
- 管理API保護: `lib/server/adminGuard.ts`、`app/api/admin/*` に導入
- ワンコマンド投入: `npm run seed:dev`
- 共有用テンプレ: `.env.example`

