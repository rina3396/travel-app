// app/auth/login/page.tsx — ログインページ
"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted && session) router.replace("/trips")
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_evt: unknown, session: unknown) => {
      if (session) router.replace("/trips")
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [router, supabase])

  const loginWithEmailPassword = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    setLoading(false)
    if (error) {
      if (error.message === "Invalid login credentials") {
        setError("メールアドレスまたはパスワードが正しくありません")
      } else {
        setError(`ログインに失敗しました: ${error.message}`)
      }
      return
    }
    router.replace("/trips")
  }

  return (
    <section className="mx-auto max-w-sm space-y-4 p-4 text-sm">
      <h1 className="text-lg font-semibold">ログイン</h1>
      <p>メールアドレスとパスワードでログインできます。</p>
      <form onSubmit={loginWithEmailPassword} className="space-y-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="********"
            autoComplete="current-password"
            required
          />
        </label>
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-orange-500 py-2 text-white disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
          <Link
            href="/auth/register"
            className="w-full rounded border border-orange-500 py-2 text-center text-orange-700 transition hover:bg-orange-500 hover:text-white"
          >
            新規登録
          </Link>
        </div>
      </form>
      {error && <p className="text-red-600">{error}</p>}
    </section>
  )
}
