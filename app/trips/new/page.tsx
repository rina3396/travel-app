// app/trips/new/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TripNewPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title }),
            })

            if (res.ok) {
                const { id } = await res.json()
                router.push(`/trips/${encodeURIComponent(id)}`)
                return
            }

            const { error } = await res.json().catch(() => ({ error: "作成に失敗しました" }))
            setError(error ?? "作成に失敗しました")
        } catch {
            setError("ネットワークエラーが発生しました。時間をおいて再度お試しください。")
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