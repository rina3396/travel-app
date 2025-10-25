// app/auth/login/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // すでにログイン済みなら即リダイレクト
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) router.replace("/trips/new")
        })()
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
            if (session) router.replace("/trips/new")
        })
        return () => sub.subscription.unsubscribe()
    }, []) // eslint-disable-line

    const signInWithPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null); setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (error) setError(error.message)
        // 成功時は onAuthStateChange 経由で /trips/new へ遷移
    }

    return (
        <section className="p-4 max-w-sm mx-auto space-y-4">
            <h1 className="text-lg font-semibold">ログイン</h1>
            <form onSubmit={signInWithPassword} className="space-y-3">
                <input className="w-full border rounded px-3 py-2 text-sm"
                    type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full border rounded px-3 py-2 text-sm"
                    type="password" placeholder="パスワード"
                    value={password} onChange={e => setPassword(e.target.value)} />
                <button disabled={loading} className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50">
                    {loading ? "送信中…" : "ログイン"}
                </button>
            </form>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </section>
    )
}
