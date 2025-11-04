# app ディレクトリ構成と役割

このドキュメントは `app/` 配下の現在のルーティング・API 構成と各ファイルの役割をまとめたものです。

## ツリー

```
app/
├─ favicon.ico
├─ layout.tsx
├─ loading.tsx
├─ page.tsx
├─ api/
│  └─ trips/
│     ├─ new/route.ts
│     └─ [tripId]/
│        ├─ route.ts
│        ├─ index/route.ts
│        ├─ tasks/route.ts
│        ├─ tasks/[taskId]/route.ts
│        ├─ activities/route.ts
│        ├─ activities/[activityId]/route.ts
│        ├─ activities/assign-day/route.ts
│        ├─ days/[date]/route.ts
│        ├─ days/[date]/activities/reorder/route.ts
│        └─ budget/expenses/route.ts
├─ auth/
│  └─ login/page.tsx
├─ guide/
│  └─ page.tsx
└─ trips/
   ├─ loading.tsx
   ├─ page.tsx
   ├─ new/page.tsx
   └─ [tripId]/
      ├─ layout.tsx
      ├─ page.tsx
      ├─ activities/page.tsx
      ├─ activities/[activityId]/page.tsx
      ├─ budget/page.tsx
      ├─ days/page.tsx
      ├─ preview/page.tsx
      ├─ settings/page.tsx
      ├─ share/page.tsx
      └─ tasks/page.tsx
```

## 各ファイルの説明

- `app/layout.tsx`
  - アプリ共通レイアウト。ヘッダー/フッター、メタ、テーマなどの全体枠を定義。
- `app/loading.tsx`
  - ルートレイアウト配下のフォールバック UI（スケルトン）。初期ロード中に表示。
- `app/page.tsx`
  - ルート(`/`)のエントリ。サーバー側で Supabase のユーザーを確認し、
    - ログイン済みなら `/trips` へ
    - 未ログインなら `/auth/login` へ
    即時リダイレクト。
- `app/favicon.ico`
  - サイトのファビコン。

### API ルート（`app/api/trips/**`）
- `app/api/trips/new/route.ts`
  - POST: 旅行新規作成。タイトルや日付、参加者を受け取り、DB に `trips` を作成。参加者は存在すれば `trip_members` へ登録。
- `app/api/trips/[tripId]/route.ts`
  - 該当旅行のルート。一般に GET/DELETE/PATCH など旅行単位の操作を担当（UI からは削除などで利用）。
- `app/api/trips/[tripId]/index/route.ts`
  - GET: 旅行の基本情報（メタデータ）を取得。
- `app/api/trips/[tripId]/tasks/route.ts`
  - GET/POST: タスク一覧取得・作成。
- `app/api/trips/[tripId]/tasks/[taskId]/route.ts`
  - PATCH/DELETE: 特定タスクの更新・削除。
- `app/api/trips/[tripId]/activities/route.ts`
  - GET/POST: アクティビティ一覧取得・作成。
- `app/api/trips/[tripId]/activities/[activityId]/route.ts`
  - GET/PATCH/DELETE: 特定アクティビティの取得・更新・削除。
- `app/api/trips/[tripId]/activities/assign-day/route.ts`
  - POST: アクティビティを指定日の行程へ割り当て。
- `app/api/trips/[tripId]/days/[date]/route.ts`
  - GET/POST: 指定日の行程（Day レコード）の取得・作成。
- `app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts`
  - POST: 指定日のアクティビティ並び順を一括更新。
- `app/api/trips/[tripId]/budget/expenses/route.ts`
  - GET/POST: 予算・費用の取得・登録。

### 認証/ガイド
- `app/auth/login/page.tsx`
  - ログイン画面（メール + パスワード）。Supabase クライアントを用い、ログイン後は `/trips` へ遷移。
- `app/guide/page.tsx`
  - ガイド/使い方ページ。

### 旅行 UI（`app/trips/**`）
- `app/trips/page.tsx`
  - 旅行の一覧表示ページ。
- `app/trips/loading.tsx`
  - `/trips` セグメントのスケルトン（一覧のローディング UI）。
- `app/trips/new/page.tsx`
  - 旅行作成ウィザード（タイトル・日付・参加者等の入力）。
- `app/trips/[tripId]/layout.tsx`
  - 個別旅行配下の共通レイアウト。
- `app/trips/[tripId]/page.tsx`
  - 旅行トップ（概要・ナビゲーション）。
- `app/trips/[tripId]/activities/page.tsx`
  - アクティビティ一覧・日付割当などの操作 UI。
- `app/trips/[tripId]/activities/[activityId]/page.tsx`
  - 特定アクティビティ詳細の表示・編集。
- `app/trips/[tripId]/days/page.tsx`
  - 日程（Day）ベースのビューと操作。
- `app/trips/[tripId]/budget/page.tsx`
  - 予算・費用の管理 UI。
- `app/trips/[tripId]/tasks/page.tsx`
  - タスク管理 UI。
- `app/trips/[tripId]/share/page.tsx`
  - メンバー共有や公開設定などの UI。
- `app/trips/[tripId]/settings/page.tsx`
  - 旅行設定（編集・削除への導線など）。
- `app/trips/[tripId]/preview/page.tsx`
  - 作成直後/編集中の旅行のプレビュー表示。

