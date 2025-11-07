# 画面一覧（Next.js App Router）

本アプリの主要な画面と対応ルートの一覧です。用途、認可、関連テーブルの目安を併記しています。

## 公開/認証前
- パス: `/`
  - ファイル: `app/page.tsx`
  - 概要: ログイン済みなら `/trips` へリダイレクト。未ログイン時はランディングを表示。
  - 認可: 公開（セッションでリダイレクト制御）
  - 主なデータ: なし

- パス: `/auth/login`
  - ファイル: `app/auth/login/page.tsx`
  - 概要: メール/パスワードでのログインフォーム。成功時 `/trips` へ遷移。
  - 認可: 公開（ログイン後は `/trips` へ誘導）
  - 主なデータ: `auth`（Supabase）

- パス: `/guide`
  - ファイル: `app/guide/page.tsx`
  - 概要: アプリの使い方ガイド。
  - 認可: 公開
  - 主なデータ: なし

## トリップ一覧/作成
- パス: `/trips`
  - ファイル: `app/trips/page.tsx`
  - 概要: 自分が関係するトリップの一覧。各トリップ詳細へのリンクを提供。
  - 認可: 要ログイン（RLSでユーザーのトリップのみ表示）
  - 主なテーブル: `trips`

- パス: `/trips/new`
  - ファイル: `app/trips/new/page.tsx`
  - 概要: 新規トリップ作成フロー。
  - 認可: 要ログイン
  - 主なテーブル: `trips`

## トリップ配下（動的セグメント）
- パス: `/trips/[tripId]`
  - ファイル: `app/trips/[tripId]/page.tsx`
  - 概要: トリップの概要トップ。各機能（行程/日程/タスク/予算/共有/設定）へのハブ。
  - 認可: 要ログイン（メンバーのみ）
  - 主なテーブル: `trips`, `trip_members`, `trip_days`, `activities`, `expenses`, `tasks`, `budgets`, `share_links`

- パス: `/trips/[tripId]/activities`
  - ファイル: `app/trips/[tripId]/activities/page.tsx`
  - 概要: 行程（アクティビティ）の一覧・編集。
  - 認可: 要ログイン（メンバー、編集は owner/editor）
  - 主なテーブル: `activities`, `trip_days`

- パス: `/trips/[tripId]/activities/[activityId]`
  - ファイル: `app/trips/[tripId]/activities/[activityId]/page.tsx`
  - 概要: 特定アクティビティの詳細/編集。
  - 認可: 要ログイン（メンバー、編集は owner/editor）
  - 主なテーブル: `activities`

- パス: `/trips/[tripId]/days`
  - ファイル: `app/trips/[tripId]/days/page.tsx`
  - 概要: 日付単位の計画（トリップデイ）の一覧/編集。
  - 認可: 要ログイン（メンバー、編集は owner/editor）
  - 主なテーブル: `trip_days`, `activities`

- パス: `/trips/[tripId]/tasks`
  - ファイル: `app/trips/[tripId]/tasks/page.tsx`
  - 概要: トリップに紐づくタスク管理。
  - 認可: 要ログイン（メンバー、編集は owner/editor）
  - 主なテーブル: `tasks`

- パス: `/trips/[tripId]/budget`
  - ファイル: `app/trips/[tripId]/budget/page.tsx`
  - 概要: 予算と支出の概要。
  - 認可: 要ログイン（メンバー）
  - 主なテーブル: `budgets`, `expenses`

- パス: `/trips/[tripId]/share`
  - ファイル: `app/trips/[tripId]/share/page.tsx`
  - 概要: メンバーの招待・権限設定、共有リンク管理。
  - 認可: 要ログイン（owner/editor で編集）
  - 主なテーブル: `trip_members`, `share_links`

- パス: `/trips/[tripId]/settings`
  - ファイル: `app/trips/[tripId]/settings/page.tsx`
  - 概要: トリップの設定（タイトル、日付、アーカイブ等）。
  - 認可: 要ログイン（owner/editor）
  - 主なテーブル: `trips`

- パス: `/trips/[tripId]/preview`
  - ファイル: `app/trips/[tripId]/preview/page.tsx`
  - 概要: トリップのプレビュー（共有想定の読み取りビュー）。
  - 認可: 要ログイン（メンバー）
  - 主なテーブル: `trips`, `trip_days`, `activities`

## 補足
- `app/trips/loading.tsx` はロード中のプレースホルダーを表示するためのスケルトンUIです。
- API ルート（`app/api/**`）は画面ではないため本一覧からは除外しています。

 

## ディレクトリ/ファイル ツリー（線付き）
```
app/
├── layout.tsx
├── loading.tsx
├── page.tsx
├── auth/
│   └── login/
│       └── page.tsx
├── guide/
│   └── page.tsx
└── trips/
    ├── loading.tsx
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    └── [tripId]/
        ├── layout.tsx
        ├── page.tsx
        ├── activities/
        │   ├── page.tsx
        │   └── [activityId]/
        │       └── page.tsx
        ├── budget/
        │   └── page.tsx
        ├── days/
        │   └── page.tsx
        ├── preview/
        │   └── page.tsx
        ├── settings/
        │   └── page.tsx
        ├── share/
        │   └── page.tsx
        └── tasks/
            └── page.tsx
```
