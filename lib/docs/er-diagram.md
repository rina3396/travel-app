# ER図（Mermaid）

`lib/supabase/sql/table_schema.sql` を元にしたER図です。`AUTH_USERS` は Supabase の `auth.users` を示す外部テーブルとして表しています。

```mermaid
erDiagram
  AUTH_USERS {
    UUID id PK "from auth schema"
  }
  PROFILES {
    UUID id PK,FK
    TEXT display_name
    TEXT avatar_url
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  TRIPS {
    UUID id PK
    UUID owner_id FK
    TEXT title
    TEXT description
    DATE start_date
    DATE end_date
    TEXT currency_code
    BOOLEAN is_archived
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  TRIP_MEMBERS {
    UUID trip_id PK,FK
    UUID user_id PK,FK
    MEMBER_ROLE role
    TIMESTAMPTZ added_at
  }
  TRIP_DAYS {
    UUID id PK
    UUID trip_id FK
    DATE date
    TEXT note
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  ACTIVITIES {
    UUID id PK
    UUID trip_id FK
    TEXT title
    TEXT start_time
    TEXT end_time
    TEXT location
    TEXT note
    UUID day_id FK
    INTEGER order_no
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  EXPENSES {
    UUID id PK
    UUID trip_id FK
    DATE date
    TEXT title
    TEXT category
    NUMERIC amount
    UUID paid_by FK
    TEXT paid_by_name
    UUID[] split_with
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  TASKS {
    UUID id PK
    UUID trip_id FK
    TEXT title
    TEXT kind
    BOOLEAN done
    INTEGER sort_order
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
  SHARE_LINKS {
    UUID id PK
    UUID trip_id FK
    UUID created_by FK
    BOOLEAN is_enabled
    TIMESTAMPTZ expires_at
    TIMESTAMPTZ created_at
  }
  BUDGETS {
    UUID id PK
    UUID trip_id UNIQUE,FK
    NUMERIC amount
    TEXT currency
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }

  %% Relationships
  AUTH_USERS ||--o| PROFILES : "profiles.id"
  AUTH_USERS ||--o{ TRIPS : "owner_id"
  TRIPS ||--o{ TRIP_MEMBERS : "trip_id"
  AUTH_USERS ||--o{ TRIP_MEMBERS : "user_id"
  TRIPS ||--o{ TRIP_DAYS : "trip_id"
  TRIPS ||--o{ ACTIVITIES : "trip_id"
  TRIP_DAYS ||--o{ ACTIVITIES : "day_id"
  TRIPS ||--o{ EXPENSES : "trip_id"
  AUTH_USERS ||--o{ EXPENSES : "paid_by"
  TRIPS ||--o{ TASKS : "trip_id"
  TRIPS ||--o{ SHARE_LINKS : "trip_id"
  AUTH_USERS ||--o{ SHARE_LINKS : "created_by"
  TRIPS ||--|| BUDGETS : "trip_id"
```

補足:
- `BUDGETS` は `TRIPS` と 1:1（各トリップに1レコード）。
- `TRIP_MEMBERS` は (trip_id, user_id) の複合主キー。
- `ACTIVITIES.day_id` は NULL を許容（特定日未紐付けアクティビティを表現可能）。
- `EXPENSES.split_with` は配列（分割対象ユーザーID）。
