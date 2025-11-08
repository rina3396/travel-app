// app/auth/login/page.tsx // ログインページ（クライアントコンポーネント）
"use client"

import { FormEvent, useEffect, useMemo, useState } from "react" // Reactの型とフックをインポート
import { useRouter } from "next/navigation" // Next.js のルーターを使用
import { createClientBrowser } from "@/lib/supabase/client" // ブラウザ用のSupabaseクライアント

export default function LoginPage() { // ログインページコンポーネント
  const router = useRouter() // ルーターの取得
  const supabase = useMemo(() => createClientBrowser(), []) // Supabaseクライアントをメモ化

  const [email, setEmail] = useState("") // メールアドレスの状態
  const [password, setPassword] = useState("") // パスワードの状態
  const [loading, setLoading] = useState(false) // ローディング状態
  const [error, setError] = useState<string | null>(null) // エラーメッセージ

  useEffect(() => { // 認証状態の監視と即時リダイレクト
    let mounted = true // マウント状態フラグ
    ;(async () => { // 即時実行の非同期関数
      const { data: { session } } = await supabase.auth.getSession() // 現在のセッションを取得
      if (mounted && session) router.replace("/trips") // ログイン済みならページ遷移
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_evt: unknown, session: unknown) => { // 認証状態の変化を購読
      if (session) router.replace("/trips") // セッションがあれば遷移
    })
    return () => { mounted = false; sub.subscription.unsubscribe() } // クリーンアップ: 購読解除
  }, [router, supabase]) // 依存配列

  const loginWithEmailPassword = async (e?: FormEvent) => { // メール/パスワードでのログイン処理
    if (e) e.preventDefault() // フォームのデフォルト送信を抑止
    const normalizedEmail = email.trim().toLowerCase() // メールの正規化
    if (!normalizedEmail || !password) { // 入力チェック
      setError("���[���A�h���X�ƃp�X���[�h����͂��Ă�������") // 未入力エラー
      return // 以降の処理を中断
    }
    setLoading(true) // ローディング開始
    setError(null) // 既存エラーを消去
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password }) // サインイン実行
    setLoading(false) // ローディング終了
    if (error) { // エラーがある場合
      if (error.message === "Invalid login credentials") { // 資格情報エラー
        setError("���[���A�h���X�܂��̓p�X���[�h������������܂���") // 不正資格情報メッセージ
      } else { // その他のエラー
        setError(`���O�C���Ɏ��s���܂���: ${error.message}`) // 汎用エラーメッセージ
      }
      return // 処理中断
    }
    router.replace("/trips") // 成功時にトリップ一覧へ遷移
  }

  return ( // コンポーネントの描画
    <section className="mx-auto max-w-sm space-y-4 p-4 text-sm"> {/* コンテンツ幅と余白を調整 */}
      <h1 className="text-lg font-semibold">���O�C��</h1> {/* 見出し */}
      <p>���[���A�h���X�ƃp�X���[�h�Ń��O�C���ł��܂��B</p> {/* 説明文 */}
      <form onSubmit={loginWithEmailPassword} className="space-y-3"> {/* ログインフォーム */}
        <label className="flex flex-col gap-2 text-sm"> {/* メール入力ラベル */}
          <span className="font-medium">���[���A�h���X</span> {/* ラベルテキスト */}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
            required
          /> {/* メール入力 */}
        </label>
        <label className="flex flex-col gap-2 text-sm"> {/* パスワード入力ラベル */}
          <span className="font-medium">�p�X���[�h</span> {/* ラベルテキスト */}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="********"
            autoComplete="current-password"
            required
          /> {/* パスワード入力 */}
        </label>
        <div className="flex flex-col gap-2"> {/* 送信ボタン領域 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-orange-500 py-2 text-white disabled:opacity-50"
          >
            {loading ? "�������c" : "���O�C��"} {/* ローディング中は文言を切替 */}
          </button>
        </div>
      </form>
      {error && <p className="text-red-600">{error}</p>} {/* エラー表示 */}
    </section>
  )
}

