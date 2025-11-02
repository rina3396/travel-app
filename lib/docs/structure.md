# Travel App プロジェクト構成（詳細ガイド）

本書は本リポジトリ（Next.js App Router + Supabase）のディレクトリ別・ファイル別の役割、主要データフロー、API 仕様、型/DB モデル、開発運用の要点をまとめたものです。

---

## 1. ルート構成と概要

- `app/` — App Router のページ、レイアウト、Route Handlers（API）を集約
- `components/` — 再利用 UI とレイアウトコンポーネント
- `lib/` — Supabase クライアント生成やサーバー側ユーティリティ
- `types/` — UI ドメイン型と Supabase 生成型
- `supabase/` — スキーマ、マイグレーション、シード
- `styles/` — グローバル CSS
- ルート設定: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json`, `README.md`

開発コマンド（`package.json` より）:

- 開発: `npm run dev`（Turbopack）
- 本番ビルド: `npm run build`（Turbopack）
- 本番起動: `npm start`
- Lint: `npm run lint`

必要な環境変数（クライアント/SSR 共通）:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. App Router（ページ/レイアウト/API）

### 2.1 ルートレイアウト/トップ

- `app/layout.tsx`
  - ルートレイアウト。`<html lang="ja">`、共通ヘッダー/フッター、`globals.css` の読込。
- `app/page.tsx`
  - ルートページ。SSR で `auth.getUser()` を取得し、
    - ログイン済み: `/trips` へリダイレクト
    - 未ログイン: `/auth/login` へリダイレクト

### 2.2 認証フロー（Auth）

- `app/auth/login/page.tsx` — ログイン画面
- `app/auth/signup/page.tsx` — サインアップ画面
- `app/auth/callback/route.ts` — OAuth/マジックリンクのコールバック
- `app/auth/refresh/route.ts` — セッション更新等

### 2.3 Trips（旅行機能）

- `app/trips/page.tsx`
  - 旅行一覧（SSR）。`trips` テーブルから `id,title,start_date,end_date` を取得して表示。
  - 新規作成導線 `/trips/new`。
- `app/trips/new/page.tsx`
  - 新規旅行の作成フォーム/ウィザード。
- `app/trips/[tripId]/layout.tsx`
  - 個別旅行配下の共通レイアウト（ナビ/タブ/余白）。
- `app/trips/[tripId]/page.tsx`
  - 旅行ダッシュボード（タイトル・期間などの概要）。
  - 下位ページ（Activities/Days/Budget/Tasks/Share/Settings/Preview）へのハブ。
- `app/trips/[tripId]/activities/page.tsx`
  - アクティビティ一覧・追加。クエリ `?date=YYYY-MM-DD` による日付フィルタ。
  - 未割当項目を対象日に移す操作、並び順変更（reorder API 利用）への導線。
- `app/trips/[tripId]/activities/[activityId]/page.tsx`
  - 個別アクティビティ詳細（閲覧/更新/削除）。
- `app/trips/[tripId]/days/page.tsx`
  - 日別スケジュールの一覧/生成。
- `app/trips/[tripId]/budget/page.tsx`
  - 予算・費用の登録/一覧/集計（支払者、割り勘、カテゴリ）。
- `app/trips/[tripId]/tasks/page.tsx`
  - TODO/持ち物の管理（追加/フィルタ/チェック/削除）。
- `app/trips/[tripId]/share/page.tsx`
  - メンバー招待と権限管理、共有リンクの発行/コピー。
- `app/trips/[tripId]/preview/page.tsx`
  - 旅行計画のプレビュー（共有/印刷向け）。

### 2.4 API Routes（Route Handlers）

- 管理/運用系
  - `app/api/admin/users/lookup/route.ts` — メールからユーザー ID を引く内部 API
  - `app/api/admin/dev-seed/route.ts` — 開発用シード投入
  - `app/api/admin/profiles/sync/route.ts` — プロファイル同期等
- 旅行リソース系
  - `app/api/trips/new/route.ts` — POST: 旅行作成
  - `app/api/trips/[tripId]/index/route.ts` — GET: 基本情報
  - `app/api/trips/[tripId]/tasks/route.ts` — GET/POST: タスク一覧/作成
  - `app/api/trips/[tripId]/tasks/[taskId]/route.ts` — PATCH/DELETE: タスク更新/削除
  - `app/api/trips/[tripId]/activities/route.ts` — GET/POST: アクティビティ一覧/作成
  - `app/api/trips/[tripId]/activities/[activityId]/route.ts` — GET/PATCH/DELETE: アクティビティ詳細
  - `app/api/trips/[tripId]/activities/assign-day/route.ts` — POST: 指定日への割当
  - `app/api/trips/[tripId]/days/[date]/route.ts` — GET/POST: Day レコード取得/作成
  - `app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts` — POST: 並び順一括更新

---

## 3. コンポーネント

### 3.1 レイアウト

- `components/layout/AppHeader.tsx`
  - グローバルナビ、ログアウト、パスに応じた表示制御。
- `components/layout/AppFooter.tsx`
  - フッター（戻るボタン/コピーライト）。

### 3.2 UI（再利用）

- `components/ui/Button.tsx`
  - `variant: "primary"|"outline"|"danger"|"ghost"`
  - `size: "sm"|"md"`
  - `href` の有無で `<Link>`/`<button>` を自動出し分け。
- `components/ui/Card.tsx` — 枠/余白の統一コンテナ。
- `components/ui/Chip.tsx` — pill 形の小トグル（フィルタなど）。
- `components/ui/Skeleton.tsx` — ローディングのプレースホルダ。
- `components/ui/BackButton.tsx` — 戻るショートカット。

---

## 4. Supabase 連携（lib/）

- `lib/supabase/server.ts`
  - SSR/Route Handler 用のクライアント生成。Cookie と結び付き、RLS を前提にアクセス。
  - サーバーコンポーネントで `const { supabase } = await createServer()` の形で使用。
- `lib/supabase/client.ts`
  - ブラウザ用クライアント。`createBrowserClient(url, anon)` を使用。
  - フォーム送信や UI のイベントハンドラで利用。
- `lib/supabase/admin.ts`
  - 管理 API から利用するサーバー側ユーティリティ（サービスキー/管理操作向け）。
- `lib/supabase/migrations/*.sql`
  - DB スキーマ定義/変更（例: 所有者/ロール設定、旅行関連テーブル）。

---

## 5. 型定義（types/）

- `types/database.types.ts`
  - Supabase 生成の厳密型。DB テーブル/カラム/リレーションに準拠。
  - ヘルパー型: `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>`, `Enums<T>` など。
- `types/trips.ts`
  - UI 向けドメイン型（Trip / Task / Activity / Expense / Participant 等）。
  - 画面都合の正規化（例: null を undefined に寄せる、日付/時間の文字列整形 など）。

UI と DB 型の使い分け指針:

- API/SSR の select/insert/update には DB 生成型（`types/database.types.ts`）。
- 画面ステート/表示にはドメイン型（`types/trips.ts`）。
- 相互変換（`toActivity` などの関数）はページ内/ユーティリティに配置。

---

## 6. データモデル（主なテーブル）

実装/型から読み取れる代表的な列のみ抜粋：

- `trips` — id, title, start_date, end_date, updated_at
- `days` — id, trip_id, date, title, note, created_at
- `activities` — id, trip_id, day_id, title, start_time, end_time, location, note, order_no, created_at
- `expenses` — id, trip_id, date, title, category, amount, paid_by, split_with, created_at
- `trip_members` — trip_id, user_id, role
- `share_links` — id, trip_id, is_enabled, expires_at, created_at
- `budgets` — trip_id, amount, currency

RLS 前提のため、常に「ログインユーザーがアクセス権を持つ行」のみが返る設計です。

---

## 7. データフロー/画面遷移の要点

- SSR 初期化
  - サーバーコンポーネント内で `createServer()` → Cookie と結び付いた Supabase クライアントを取得。
  - 認可は RLS が担保。`select()/insert()/update()` をそのまま実行可能。
- クライアント操作
  - UI → API Routes に `fetch`（POST/PATCH/DELETE） → DB 更新 → 再取得してステート反映。
- 旅行機能の代表操作
  - 旅行一覧: `/trips`（SSR）
  - タスク: `/trips/[tripId]/tasks`（追加/更新/削除）
  - アクティビティ: `/trips/[tripId]/activities`（日付別、未割当の移動、並び替え）
  - 予算/費用: `/trips/[tripId]/budget`（登録/集計/残高計算）
  - 共有: `/trips/[tripId]/share`（メンバー/リンク管理）

---

## 8. API 仕様（抜粋の I/O）

> 実装基準で読み取れる入出力の要約です。厳密なスキーマは DB/生成型に従います。

- `POST /api/trips/new`
  - body: `{ title: string, start_date?: string, end_date?: string }`
  - res: `201/400` など（新規 trip の id を返す設計が望ましい）
- `GET /api/trips/[tripId]/index`
  - res: `{ id, title, start_date, end_date }`
- `GET/POST /api/trips/[tripId]/tasks`
  - GET res: `DbTask[]`
  - POST body: `{ title: string, kind: 'todo'|'packing' }`
- `PATCH/DELETE /api/trips/[tripId]/tasks/[taskId]`
  - PATCH body: `{ done?: boolean, title?: string, kind?: ... }`
- `GET/POST /api/trips/[tripId]/activities`
  - GET res: `DbActivity[]`
  - POST body: `{ title, startTime?, endTime?, location?, note?, dayId?, order_no? }`
- `POST /api/trips/[tripId]/activities/assign-day`
  - body: `{ id: string, date: string }`
- `GET/POST /api/trips/[tripId]/days/[date]`
  - GET res: `{ dayId?: string }`（なければ空、POST で作成）
- `POST /api/trips/[tripId]/days/[date]/activities/reorder`
  - body: `{ orders: { id: string, order_no: number }[] }`
- `GET/POST /api/trips/[tripId]/budget/expenses`
  - GET res: `DbExpense[]`
  - POST body: `{ date, title, category, amount, paidBy, splitWith[] }`
- 管理系 `POST /api/admin/users/lookup`
  - body: `{ email: string }` → res: `{ id: string }`

---

## 9. 命名規約/コーディング指針

- App Router 規約
  - ページ: `page.tsx`
  - レイアウト: `layout.tsx`
  - API: `route.ts`（ディレクトリ=エンドポイント）
  - 動的セグメント: `[tripId]`, `[activityId]`, `[date]` 等
- 型の扱い
  - DB アクセスには `types/database.types.ts`（生成型）
  - UI ステート/表示には `types/trips.ts`（ドメイン型）
- UI
  - 再利用部品は `components/ui/` に集約
  - レイアウト共通は `components/layout/`
- Supabase
  - SSR/Route Handlers は `lib/supabase/server.ts` を使用
  - ブラウザは `lib/supabase/client.ts` を使用

---

## 10. よくある拡張作業の流れ

1) DB カラム追加
- `lib/supabase/migrations/` に SQL を追加
- 生成型（`types/database.types.ts`）を更新

2) API 拡張
- 対応する `app/api/.../route.ts` を拡張（select/insert/update 対応）

3) UI 反映
- ドメイン型（`types/trips.ts`）を更新
- ページ/コンポーネントにフォーム/表示を追加

4) 動作確認
- `npm run dev` で動作/型/ESLint チェック

---

## 11. トラブルシューティング（文字化け/ビルド失敗）

症状: Turbopack が「invalid UTF-8」のエラーでソース解析に失敗。

対処:
- エディタの「文字コードを指定して保存」で UTF-8（BOM なし）に統一
- 文字化け部を読める文言（日本語/英語）に修正
- 保存後に再ビルド

参考（要確認の候補ファイル）:
- `app/trips/[tripId]/*` 配下の複数 `page.tsx`
- `app/api/trips/[tripId]/days/[date]/activities/reorder/route.ts`
- `types/database.types.ts`

---

## 12. 参考：ユースケース別リンク

- 旅行一覧: `/trips`
- 新規旅行: `/trips/new`
- タスク: `/trips/[tripId]/tasks`
- アクティビティ: `/trips/[tripId]/activities`
- 予算/費用: `/trips/[tripId]/budget`
- 共有: `/trips/[tripId]/share`
- 設定: `/trips/[tripId]/settings`
- プレビュー: `/trips/[tripId]/preview`

---

このドキュメントの改善や粒度追加（API リクエスト/レスポンス例、画面ごとの props/状態、RLS ポリシー詳細など）も対応可能です。必要な章立てをお知らせください。
