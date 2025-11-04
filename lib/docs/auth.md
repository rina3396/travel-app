# 認証フロー詳細ガイド（Auth）

このドキュメントは、本プロジェクトの認証フローに関与するファイル群の役割、SSR/CSR の責務分離、セキュリティ留意点、実装パターン、テスト観点をまとめたものです。

対象:
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/refresh/route.ts`
- 連携ユーティリティ: `lib/supabase/server.ts`, `lib/supabase/client.ts`

---

## 全体像

- Supabase を認証基盤とし、RLS（Row Level Security）を前提に SSR/CSR を構成。
- SSR（App Router のサーバーコンポーネント/Route Handler）は `lib/supabase/server.ts` の `createServer()` を利用し、Cookie 経由でユーザーセッションを扱う。
- CSR（クライアントコンポーネント/ブラウザのイベント）は `lib/supabase/client.ts` の `createClientBrowser()` を利用。
- OAuth/マジックリンク完了後は `callback` でサーバー側 Cookie を確立し、必要なら `refresh` を叩いて SSR と CSR の Cookie 整合を取る。

---

## ファイル別の役割と実装ポイント

### app/auth/login/page.tsx — ログイン画面

役割:
- 未ログインユーザーのログイン UI を提供し、成功後にアプリのメイン（例: `/trips`）へ遷移。
- 既ログインの判定が可能なら早期リダイレクトで UX を最適化。

実装の要点:
- ブラウザ側の Supabase クライアント（`createClientBrowser`）で `auth.signInWithPassword` または OAuth への遷移を実行。
- 成功時 `router.replace('/trips')`。失敗時は UI 上にメッセージを表示。
- SSR で「既ログインならリダイレクト」を入れる場合は、上位レイアウト/トップで判定してもよい。

擬似コード（クライアント側）:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientBrowser } from '@/lib/supabase/client'

export default function LoginPage() {
  const r = useRouter()
  const supabase = createClientBrowser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    r.replace('/trips')
  }

  return /* フォーム実装 */
}
```

### app/auth/signup/page.tsx — サインアップ画面

役割:
- 新規ユーザー登録の UI を担う。確認メール有無のポリシーはアプリ方針に依存。

実装の要点:
- `auth.signUp({ email, password })` を使用。
- 確認メールフローを採用する場合は「メール送信完了」画面へ誘導。即ログインならログイン同様に `/trips` へ。
- バリデーション（パスワード強度、同意チェック等）を UI で行う。

擬似コード:
```tsx
'use client'
import { createClientBrowser } from '@/lib/supabase/client'

// フォーム送信で supabase.auth.signUp を呼ぶ
```

### app/auth/callback/route.ts — OAuth/マジックリンクのコールバック

役割:
- OAuth/マジックリンクからリダイレクトされた際に、サーバー側でセッションを確立し、Cookie を設定して安全な遷移先へ誘導。

実装の要点:
- `lib/supabase/server.ts` の `createServer()` を使用し、Supabase の SSR クライアントを生成。
- プロバイダから返る `code` と `state` を検証（CSRF 対策）。
- セッション確立に伴い Supabase から発行される Set-Cookie を `applyPendingCookies` でレスポンスに反映。
- 正常時はアプリの既定ページ（例: `/trips`）へ `redirect`。失敗時は `/auth/login?error=...` などへ。

擬似コード（概略）:
```ts
import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  // state 検証（省略）

  const { supabase, applyPendingCookies } = await createServer()

  // ここでコード交換が走る（@supabase/ssr は URL/クッキーを解釈してセッションを内部的に確立）
  // 必要に応じて supabase 側の helper を呼び、セッション確立を完了させる

  const res = NextResponse.redirect(new URL('/trips', url))
  applyPendingCookies(res) // Set-Cookie を反映
  return res
}
```

注意:
- 実際のコード交換の詳細は使用バージョンにより差異があるため、`@supabase/ssr` のドキュメントに準拠。
- 失敗時のログはサーバー側に残し、ユーザーへは一般的なメッセージのみ提示。

### app/auth/refresh/route.ts — セッション更新等

役割:
- ブラウザ側でトークン更新が発生した後、SSR 側 Cookie を最新化するための軽量エンドポイント。

実装の要点:
- `createServer()` から受け取った `applyPendingCookies` を空レスポンスに適用し、`204 No Content` を返す。
- 例: ログイン完了直後/初期化直後に `await fetch('/auth/refresh', { method: 'POST' })` を呼び、SSR と CSR の整合を取る。

擬似コード:
```ts
import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'

export async function POST() {
  const { applyPendingCookies } = await createServer()
  const res = new NextResponse(null, { status: 204 })
  applyPendingCookies(res)
  return res
}
```

---

## 連携ユーティリティ

### lib/supabase/server.ts

- Next.js 15（App Router）で `await cookies()` / `await headers()` を使い、サーバー側 Supabase クライアントを生成。
- Set-Cookie は `setAll` の呼び出しで一旦バッファし、`applyPendingCookies(res)` が呼ばれたタイミングでレスポンスへ反映。
- `Authorization` ヘッダーをグローバルヘッダーに委譲する設定も可能。

戻り値:
- `supabase`: SSR 用クライアント
- `applyPendingCookies(res: Response)`: バッファ済み Cookie をレスポンスにセット

### lib/supabase/client.ts

- ブラウザ用 Supabase クライアントを生成。
- フォーム送信、ボタンクリック等のイベントで利用。

---

## セキュリティ/UX の留意事項

- `state` 検証: OAuth/マジックリンクのコールバックで CSRF を防止。
- リダイレクト制限: コールバック後のリダイレクト先は許可リスト内の相対パスに限定。
- エラーの取り扱い: 画面は一般的な文言、詳細はサーバーログ。PII/機密を漏らさない。
- レート制御/ボット対策: `login`/`signup` 連続試行に簡易クールダウンや CAPTCHA を検討。
- i18n: 文言は辞書化しやすい構造で管理（後から翻訳差し替え可能）。

---

## テスト観点

- 単体: 入力バリデーション、エラーメッセージ表示、フォームの活性/非活性。
- 結合: OAuth 成功/失敗、`callback` の Cookie 設定とリダイレクトの妥当性。
- E2E: 未ログインで保護ページ → ログイン → 元ページ復帰、トークン更新後の `refresh` 呼び出し。

---

## トラブルシューティング

- invalid UTF-8 によるビルド失敗: エディタで UTF-8 (BOM なし) に再保存し、文字化けを読み替えて修正。
- Cookie が SSR に反映されない: `applyPendingCookies` の呼び出し箇所（`callback`/`refresh`）を確認。
- リダイレクトループ: 既ログイン判定と保護ルートのガード条件を再確認（`/auth/*` の例外も含めて）。

---

## 将来拡張の例

- パスワードリセット（`/auth/reset`）
- MFA/OTP（メール/アプリ）
- デバイス/セッション管理（サインアウト・オブ・オール）
- 監査ログ（重要操作のメタデータ記録）
