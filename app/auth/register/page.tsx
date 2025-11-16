"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

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

  const handleRegister = async (e?: FormEvent) => {
    e?.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password || !confirmPassword) {
      setError("メールアドレス・パスワードを入力してください")
      return
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください")
      return
    }
    if (password !== confirmPassword) {
      setError("確認用パスワードが一致しません")
      return
    }
    setLoading(true)
    setError(null)
    setInfo(null)
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { display_name: displayName.trim() || null },
        emailRedirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}/auth/login`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message || "ユーザー登録に失敗しました")
      return
    }
    setInfo("登録用の確認メールを送信しました。メールを確認のうえログインしてください。")
  }

  return (
    <section className="mx-auto max-w-sm space-y-4 p-4 text-sm">
      <h1 className="text-lg font-semibold">ユーザー登録</h1>
      <p>メールアドレスとパスワードを入力してアカウントを作成します。</p>
      <form onSubmit={handleRegister} className="space-y-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">表示名（任意）</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="苗字 名前"
          />
        </label>
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
          <div className="flex items-center justify-between">
            <span className="font-medium">パスワード</span>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-orange-600 underline hover:no-underline"
            >
              {showPassword ? "隠す" : "表示"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="********"
            autoComplete="new-password"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">確認用パスワード</span>
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-xs text-orange-600 underline hover:no-underline"
            >
              {showConfirmPassword ? "隠す" : "表示"}
            </button>
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="********"
            autoComplete="new-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-orange-500 py-2 text-white disabled:opacity-50"
        >
          {loading ? "登録中..." : "アカウントを作成"}
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {info && <p className="text-green-600">{info}</p>}
      <div className="text-center text-xs text-gray-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/auth/login" className="text-orange-600 underline">
          ログインはこちら
        </Link>
      </div>
    </section>
  )
}
