# チーム向けテスト運用ガイド（SQLシード版）

## 目的
- 全員が同じ手順で「テストアカウント＋サンプルデータ」を投入し、画面で動作確認できるようにする。

## 前提
- Node.js 18+ 推奨、依存関係: `npm i`
- 環境変数（`.env.local`）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`（サーバー専用）
- DBスキーマ適用済み（`lib/supabase/migrations/table_schema.sql`）
- アプリ起動: `npm run dev`

## 手順（SQLを直接流す）
1) Supabaseでテストユーザーを作成
   - Dashboard → Authentication → Users → Add user
   - メール/パスワード: `test@example.com` / `pw0rd1111`
2) ユーザーUUIDを取得
   - Dashboardのユーザー詳細からIDをコピー、または SQL で取得:
     - Bash: `psql "$DATABASE_URL" -c "select id,email from auth.users where email='test@example.com';"`
     - PowerShell: `psql "$env:DATABASE_URL" -c "select id,email from auth.users where email='test@example.com';"`
3) シードSQLの実行
   - ファイル: `lib/supabase/migrations/dev_seed.sql`
   - Bash: `psql "$DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/migrations/dev_seed.sql`
   - PowerShell: `psql "$env:DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/migrations/dev_seed.sql`
   - 補足: `DATABASE_URL` は Project → Settings → Database → Connection string（Direct接続）
   - Supabase SQLエディタで実行する場合は、こちらのファイルを貼り付けて実行できます:
     - `lib/supabase/migrations/dev_seed_supabase_editor.sql`（test@example.com を前提にUUIDを自動解決）
4) ログイン（/auth/login）
   - `test@example.com` / `pw0rd1111`

## 確認手順（推奨）
- `/trips` 旅行一覧が表示される
- `/trips/{tripId}/activities?date=YYYY-MM-DD`
  - 「アクティビティを追加」で追加→一覧反映
  - 「未割り当てをこの日に移動」で当日に移動
  - アイテムの「削除」動作
- `/trips/{tripId}/activities/{activityId}` 詳細編集（タイトル/時刻/場所/メモ）→「保存」「削除」
- `/trips/{tripId}/budget` 予算/経費
- `/trips/{tripId}/tasks` タスク
- スクロールしてもヘッダーが固定表示

## 片付け・再シード
- Trip単位で削除: `DELETE /api/trips/{tripId}`
- 再シード: 上記SQLを再実行（必要に応じてデータや日付を調整）

## トラブルシュート
- psql接続エラー: `DATABASE_URL`（ホスト/ユーザー/パスワード/ポート）を再確認
- テーブル無し/参照エラー: `table_schema.sql` を適用後に再実行
- 日付ズレ: `baseDate` と表示のズレがある場合は1日進めて試す
