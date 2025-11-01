"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"

const SAMPLE_EMAIL = process.env.NEXT_PUBLIC_SAMPLE_EMAIL || ""
const SAMPLE_PASSWORD = process.env.NEXT_PUBLIC_SAMPLE_PASSWORD || ""

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
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
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

  const handleSampleLogin = async () => {
    if (!SAMPLE_EMAIL || !SAMPLE_PASSWORD) {
      setError("サンプル用のメールアドレスとパスワードが設定されていません。NEXT_PUBLIC_SAMPLE_EMAIL / NEXT_PUBLIC_SAMPLE_PASSWORD を設定してください。")
      return
    }
    const normalizedEmail = SAMPLE_EMAIL.trim().toLowerCase()
    try {
      setEmail(normalizedEmail)
      setPassword(SAMPLE_PASSWORD)
      setLoading(true)
      setError(null)
      const resp = await fetch("/api/sample-user", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: SAMPLE_PASSWORD }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data?.error || "サンプルユーザーの作成に失敗しました。")
      }
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: SAMPLE_PASSWORD })
      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("サンプルのメールアドレスまたはパスワードが正しくありません。")
        }
        throw new Error(`サンプルでのログインに失敗しました: ${error.message}`)
      }
    } catch (e: any) {
      setError(e?.message ?? "サンプルでのログインに失敗しました。")
      setLoading(false)
      return
    }
    setLoading(false)
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
            {loading ? "処理中…" : "ログイン"}
          </button>
          <button
            type="button"
            onClick={handleSampleLogin}
            disabled={loading}
            className="w-full rounded border py-2 disabled:opacity-50"
            title="デモ用。個人情報は入力しないでください"
          >
            サンプルでログイン
          </button>
        </div>
      </form>
      {error && <p className="text-red-600">{error}</p>}
    </section>
  )
}

