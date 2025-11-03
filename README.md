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
  - `ADMIN_ENDPOINT_SECRET`（任意の強い値）

3) ローカル起動
- `npm run dev`

4) 開発用シード投入（テストアカウント + サンプルデータ）
- 別ターミナルで実行:
  - `npm run seed:dev`
- もしくは cURL で直接:
  - `curl -X POST http://localhost:3000/api/admin/dev-seed -H "Content-Type: application/json" -H "x-admin-secret: $ADMIN_ENDPOINT_SECRET" -d '{"baseDate":"2025-11-01"}'`

5) ログイン情報
- dev-owner@example.com / Passw0rd!
- dev-editor@example.com / Passw0rd!

6) 動作確認の主な画面
- `/trips` 旅行一覧
- `/trips/{tripId}/activities?date=YYYY-MM-DD` アクティビティ一覧の追加/削除/日付移動
- `/trips/{tripId}/activities/{activityId}` アクティビティ詳細の編集/保存/削除
- `/trips/{tripId}/budget` 予算/経費
- `/trips/{tripId}/tasks` タスク

7) セキュリティ
- `app/api/admin/*` は `x-admin-secret` ヘッダで保護しています
- 本番環境では必ず十分なアクセス制限をかけてください
