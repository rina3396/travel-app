# Travel App

## 開発者向けテストワークフロー（チーム共有）

1) 依存関係のセットアップ
- Node.js 18+ を推奨
- `npm i`

2) 環境変数の設定
- `.env.example` を `.env.local` にコピーし、以下を設定
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

3) ローカル起動
- `npm run dev`

4) 開発用シード投入（SQL を直接実行）
- Supabase の Dashboard でテストユーザーを作成
  - メール/パスワード: `test@example.com` / `test1111`
- ユーザーの UUID を取得（Dashboard もしくは psql）
- psql で実行:
  - Bash: `psql "$DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/migrations/dev_seed.sql`
  - PowerShell: `psql "$env:DATABASE_URL" -v USER_1="'<TEST_USER_UUID>'" -f lib/supabase/migrations/dev_seed.sql`

5) ログイン情報
- test@example.com / test1111

6) 動作確認の主な画面
- `/trips` 旅行一覧
- `/trips/{tripId}/activities?date=YYYY-MM-DD` アクティビティ一覧の追加/削除/日付移動
- `/trips/{tripId}/activities/{activityId}` アクティビティ詳細の編集/保存/削除
- `/trips/{tripId}/budget` 予算/経費
- `/trips/{tripId}/tasks` タスク

7) 注意
- 本番環境に SQL を投入する際は十分注意してください
