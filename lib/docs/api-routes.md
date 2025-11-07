# API ルート一覧（Next.js App Router）

`app/api/` 配下のルートツリーと、対応する HTTP メソッドをまとめました。

## ツリー
```
app/api/
└── trips/
    ├── new/
    │   └── route.ts        # POST /api/trips/new
    └── [tripId]/
        ├── route.ts        # DELETE /api/trips/:tripId
        ├── index/
        │   └── route.ts    # GET /api/trips/:tripId/index
        ├── activities/
        │   ├── route.ts    # GET, POST /api/trips/:tripId/activities
        │   ├── assign-day/
        │   │   └── route.ts# POST /api/trips/:tripId/activities/assign-day
        │   └── [activityId]/
        │       └── route.ts# GET, PATCH, DELETE /api/trips/:tripId/activities/:activityId
        ├── budget/
        │   └── expenses/
        │       └── route.ts# GET, POST /api/trips/:tripId/budget/expenses
        ├── days/
        │   └── [date]/
        │       ├── route.ts# GET, POST /api/trips/:tripId/days/:date
        │       └── activities/
        │           └── reorder/
        │               └── route.ts# POST /api/trips/:tripId/days/:date/activities/reorder
        └── tasks/
            ├── route.ts    # GET, POST /api/trips/:tripId/tasks
            └── [taskId]/
                └── route.ts# PATCH, DELETE /api/trips/:tripId/tasks/:taskId
```

## エンドポイントとメソッド（抜粋）
- POST `/api/trips/new`
- DELETE `/api/trips/:tripId`
- GET `/api/trips/:tripId/index`
- GET, POST `/api/trips/:tripId/activities`
- POST `/api/trips/:tripId/activities/assign-day`
- GET, PATCH, DELETE `/api/trips/:tripId/activities/:activityId`
- GET, POST `/api/trips/:tripId/budget/expenses`
- GET, POST `/api/trips/:tripId/days/:date`
- POST `/api/trips/:tripId/days/:date/activities/reorder`
- GET, POST `/api/trips/:tripId/tasks`
- PATCH, DELETE `/api/trips/:tripId/tasks/:taskId`

備考:
- 動的セグメントは `:tripId`, `:activityId`, `:date`, `:taskId` を示しています。
- RLS により、認可は Supabase 側のポリシーで制御されます。

## ルート説明

### POST /api/trips/new
- 概要: トリップの新規作成（オーナーは実行ユーザー）。参加者メールや予算、公開リンクの同時設定に対応。
- 認可: 要ログイン。RLSで挿入権限を制御。
- リクエストBody例:
  - `title` string 必須
  - `startDate|string|null`, `endDate|string|null`（`start_date`/`end_date`でも可）
  - `participants` string[]（メールアドレスの配列。存在ユーザーをviewerで追加）
  - `budget` { `amount`?: number, `currency`?: string }
  - `share` { `public`?: boolean }（trueで共有リンクを作成）
- レスポンス: `201 { id }`。参加者の解決に失敗時 `201 { id, warning }`、未認証 `401`、不正 `400`。

### DELETE /api/trips/:tripId
- 概要: 指定トリップの削除。
- 認可: オーナー/編集権限（RLS）。
- レスポンス: 成功 `204`、エラー `400`。

### GET /api/trips/:tripId/index
- 概要: トリップの基本情報（id, title, start_date, end_date, description）。
- 認可: メンバー。
- レスポンス: 成功 `200`（JSON）、見つからない/権限なし `404`。

### GET, POST /api/trips/:tripId/activities
- GET: 指定トリップのアクティビティ一覧を `order_no` 昇順で返却。
- POST: 新規アクティビティ作成。
  - Body: `title` 必須、`startTime?`, `endTime?`, `location?`, `note?`, `dayId?`, `order_no?`
  - レスポンス: 成功 `201 { id }`、エラー `400`。

### GET, PATCH, DELETE /api/trips/:tripId/activities/:activityId
- GET: 単一アクティビティの詳細（全列）。成功 `200`、未発見 `404`。
- PATCH: 部分更新。Bodyは上記POSTと同等のキー（null可）＋`order_no?`。成功 `204`、エラー `400`。
- DELETE: 削除。成功 `204`、エラー `400`。

### GET, POST /api/trips/:tripId/days/:date
- GET: その日付の `trip_days.id` を返す（存在しなければ `dayId: null`）。
- POST: 該当日がなければ作成して `dayId` を返す（冪等）。成功 `200/201`、エラー `400`。

### POST /api/trips/:tripId/days/:date/activities/reorder
- 概要: 同一トリップ内のアクティビティ `order_no` を一括更新。
- Body: `{ orders: { id: string; order_no: number }[] }`
- レスポンス: 成功 `204`、エラー `400`。

### GET, POST /api/trips/:tripId/budget/expenses
- GET: 指定トリップの支出一覧を `date` 降順で返却。
- POST: 支出の追加。
  - Body: `date`(YYYY-MM-DD), `title`, `amount`, `category?`, `paidBy?`, `splitWith?`(uuid[])
  - レスポンス: 成功 `201 { id }`、エラー `400`。

### GET, POST /api/trips/:tripId/tasks
- GET: タスク一覧（`created_at` 降順）。
- POST: タスク作成。Body: `title` 必須、`kind?`（既定 'todo'）。成功 `201 { id }`、エラー `400`。

### PATCH, DELETE /api/trips/:tripId/tasks/:taskId
- PATCH: タスクの部分更新。Body（任意）: `title`, `kind`, `done`, `sort_order`。成功 `204`、エラー `400`。
- DELETE: タスク削除。成功 `204`、エラー `400`。

認可メモ:
- 各ハンドラは Supabase のRLS前提で、未権限時は `404` 相当や空配列、`400` が返る場合があります。確実な権限チェックはRLSポリシーに依存します。

