# テーブル定義サマリ（Supabase/PostgreSQL）

このドキュメントは `lib/supabase/sql/table_schema.sql` を基に、アプリで利用するDBテーブル定義を要約したものです。主なカラム、主キー、外部キー、一意制約、トリガー（`updated_at`更新）を記載しています。

- スキーマ: すべて `public`（一部参照先として `auth.users` を利用）
- RLS: すべてのテーブルで行レベルセキュリティを有効化（メンバー判定/編集権限で制御）
- 参考: `lib/supabase/sql/table_schema.sql`

## 列挙型（Enum）

- `member_role`（owner / editor / viewer）
  - 定義: lib/supabase/sql/table_schema.sql:9

## テーブル一覧

### profiles
- 目的: ユーザーの表示情報（`auth.users` のミラー）
- 定義: lib/supabase/sql/table_schema.sql:23
- 主キー: `id (uuid)`（`auth.users(id)` を参照, ON DELETE CASCADE）
- カラム:
  - `id uuid` — PK, FK: `auth.users(id)`
  - `display_name text`
  - `avatar_url text`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- トリガー: `trg_profiles_updated_at`（UPDATE 時 `updated_at` を自動更新）

### trips
- 目的: 旅行（トリップ）の基本情報（オーナー管理）
- 定義: lib/supabase/sql/table_schema.sql:35
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `owner_id uuid` — NOT NULL, FK: `auth.users(id)`（ON DELETE RESTRICT）
  - `title text` — NOT NULL
  - `description text`
  - `start_date date`
  - `end_date date`
  - `currency_code text` — NOT NULL, DEFAULT 'JPY'
  - `is_archived boolean` — NOT NULL, DEFAULT false
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- 制約:
  - `chk_date_range` — `start_date <= end_date`（いずれかNULLは許容）
- トリガー: `trg_trips_updated_at`

### trip_members
- 目的: トリップのメンバーとロール
- 定義: lib/supabase/sql/table_schema.sql:53
- 主キー: 複合 `trip_id, user_id`
- カラム:
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `user_id uuid` — NOT NULL, FK: `auth.users(id)`（ON DELETE CASCADE）
  - `role public.member_role` — NOT NULL, DEFAULT 'viewer'
  - `added_at timestamptz` — NOT NULL, DEFAULT now()

### trip_days
- 目的: 旅行の各日情報（トリップ×日付で一意）
- 定義: lib/supabase/sql/table_schema.sql:62
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `date date` — NOT NULL
  - `note text`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- 一意制約: `unique (trip_id, date)`
- トリガー: `trg_trip_days_updated_at`

### activities
- 目的: アクティビティ（行程）
- 定義: lib/supabase/sql/table_schema.sql:76
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `title text` — NOT NULL
  - `start_time text`
  - `end_time text`
  - `location text`
  - `note text`
  - `day_id uuid` — FK: `public.trip_days(id)`（ON DELETE SET NULL）
  - `order_no integer`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- トリガー: `trg_activities_updated_at`

### expenses
- 目的: 支出
- 定義: lib/supabase/sql/table_schema.sql:94
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `date date` — NOT NULL
  - `title text` — NOT NULL
  - `category text`
  - `amount numeric` — NOT NULL
  - `paid_by uuid` — FK: `auth.users(id)`（ON DELETE SET NULL）
  - `paid_by_name text`
  - `split_with uuid[]` — NOT NULL, DEFAULT `{}`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- トリガー: `trg_expenses_updated_at`

### tasks
- 目的: タスク（ToDo 等）
- 定義: lib/supabase/sql/table_schema.sql:111
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `title text` — NOT NULL
  - `kind text` — NOT NULL, DEFAULT 'todo'
  - `done boolean` — NOT NULL, DEFAULT false
  - `sort_order integer`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- トリガー: `trg_tasks_updated_at`

### share_links
- 目的: 共有用リンク（有効/期限付き）
- 定義: lib/supabase/sql/table_schema.sql:126
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `created_by uuid` — FK: `auth.users(id)`（ON DELETE SET NULL）
  - `is_enabled boolean` — NOT NULL, DEFAULT true
  - `expires_at timestamptz`
  - `created_at timestamptz` — NOT NULL, DEFAULT now()

### budgets
- 目的: 予算（トリップ毎に1行）
- 定義: lib/supabase/sql/table_schema.sql:136
- 主キー: `id (uuid)` — DEFAULT gen_random_uuid()
- カラム:
  - `id uuid` — PK
  - `trip_id uuid` — NOT NULL, UNIQUE, FK: `public.trips(id)`（ON DELETE CASCADE）
  - `amount numeric` — NOT NULL, DEFAULT 0
  - `currency text` — NOT NULL, DEFAULT 'JPY'
  - `created_at timestamptz` — NOT NULL, DEFAULT now()
  - `updated_at timestamptz` — NOT NULL, DEFAULT now()
- 一意制約: `trip_id`（各トリップ1レコード）
- トリガー: `trg_budgets_updated_at`

## RLS 概要（抜粋）
- すべての表で RLS 有効化。
- 代表ポリシー:
  - 参照は「メンバー（owner/参加者）」に限定。
  - 変更は「編集権限（owner / editor）」に限定。
  - `profiles` は自身の行のみ参照/変更/挿入可。

## 補足
- `updated_at` は各テーブルの BEFORE UPDATE トリガーで自動更新。
- 参考SQL: `lib/supabase/sql/table_schema.sql`
