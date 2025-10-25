// app/trips/new/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function TripNewPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ★ ブラウザ用 Supabase クライアント
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ★ マウント時にセッション確認（未ログインは /auth/login に誘導）
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) router.replace("/auth/login")
        })()
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.replace("/auth/login")
        })
        return () => sub.subscription.unsubscribe()
    }, []) // eslint-disable-line

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        // ★ 現在のアクセストークンを取得し、API に Bearer で付与
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
            setLoading(false)
            setError("未ログインです。先にログインしてください。")
            return
        }

        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ★ 重要
                },
                body: JSON.stringify({ title }),
            })

            if (res.ok) {
                const { id } = await res.json()
                router.push(`/trips/${encodeURIComponent(id)}`)
            } else {
                const { error } = await res.json().catch(() => ({ error: "作成に失敗しました" }))
                setError(error ?? `HTTP ${res.status}`)
            }
        } catch {
            setError("ネットワークエラーが発生しました。")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="p-4 max-w-md mx-auto space-y-4">
            <h1 className="text-lg font-semibold">旅の新規作成</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="旅のタイトル"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
                >
                    {loading ? "作成中…" : "作成する"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
        </section>
    )
}
